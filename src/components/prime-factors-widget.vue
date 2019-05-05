<template>
    <div class="factor-widget">
        <div class="outer">
            <p class="intro">
                Enter a positive integer to find its prime factors.
            </p>
            <p>Computation happens <em>on your computer</em> so speed may vary.</p>
            <div class="row">
                <div class="col-sm-4 col">
                    <div class="col-inner">
                        <div class="input-form">
                            <form @submit.prevent="">
                                <input 
                                    v-model="integerInput" 
                                    class="primary-number-input"
                                    :class="invalidInput ? 'red-border' : ''"
                                    type="text"
                                />
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-sm-8 col">
                    <div class="col-inner">
                        <span 
                            class="factors-list"
                        >
                            =
                            <span 
                                v-for="i in factors"
                                :key="i.key" 
                                class="factor-item"
                            >
                                ({{ i.value }})
                            </span>
                            <span ref="working">
                                <span 
                                    v-if="isWorking"
                                    class="is-working-message"
                                >
                                    (WORKING)
                                </span>
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import Debounce from "lodash.debounce";
import q from "q";
import {Decimal} from "decimal.js"

Decimal.set({precision : 64});

export default {
    props : {
        worker : {
            type : Worker,
            default : () => {
                return null;
            }
        }
    },
    data () {
        return {
            integerInput : 0,
            factors : [],
            integer : 0,
            compositeNumbers : {},
            isWorking : false,
            keyIndex : 0,
            timeoutQueue : [],
            intervalQueue : [],
            factorDeferred : null,
            invalidInput : false,
        }
    },
    watch : {
        integerInput : Debounce(function(){
            let check = this.checkValidInput(this.integerInput);
            if (check) {
                this.integer = new Decimal(this.integerInput);
                this.factor();
            }
        },100)
    },
    mounted () {
        this.animateWaiting();
    },
    methods : {
        checkValidInput (input) {
            let test = (input.length > 0 && input.search(/[^(0-9)]/) == -1);
            if (test) {
                this.invalidInput = false;
            } else {
                this.invalidInput = true;
            }
            return test;
        },
        animateWaiting () {
            let div = this.$refs.working;
            window.x = this;
            setInterval(function() {
                div.style.color = "green";
                setTimeout(function() {
                    div.style.color = "blue";
                },500);
            }, 1000);
        },
        clear () {
            for (let i = 0; i < this.timeoutQueue.length; i++) {
                clearTimeout(this.timeoutQueue[i]);
            }
            if (this.factorDeferred) {
                this.factorDeferred.reject("halt");
            }
            this.factors = [];
        },
        factorTick (int) {
            let deferred = q.defer();
            this.factorDeferred = deferred;
            let max = int.squareRoot().toNumber();
            if (this.worker !== null) {
                this.$emit("WORKER OBJECT FOUND");
                let myWorker = this.worker;
                
                myWorker.onmessage = function(e) {
                    deferred.resolve(new Decimal(e.data));
                }
                myWorker.postMessage(int.toString());
            } else {
                this.$emit("WORKER OBJECT NOT FOUND");
                this.timeoutQueue.push(setTimeout(function() {
                    for (let i = 2; i <= max; i++) {

                        let test = int.modulo(i).equals(0);
                        if (test) {
                            deferred.resolve(new Decimal(i));
                        }
                    }
                    deferred.resolve(int);
                },0));
            }
            return deferred.promise;
        },
        pushFactor (val) {
            let key = val + ":" + this.keyIndex;
            this.keyIndex++;
            this.factors.push({
                value : val,
                key : key
            });
        },
        factor () {
            this.factors = [];
            this.clear();
            let quotient = this.integer;
            
            this.isWorking = true;
            let factor;
            let self = this;
            self.$nextTick(()=> {
                self.$emit("BeginWorking");
            });
            let tick = function() {
                if (factor.lessThan(quotient)) {
                    quotient = quotient.div(factor);
                    self.pushFactor(factor.toString());
                    self.factorTick(quotient)
                        .then(val=>{
                            factor = val;
                            self.timeoutQueue(setTimeout(function(){
                                tick();
                            },0));

                        })
                        .fail(function() {
                        // do nothing
                        });
                } else {
                    self.pushFactor(factor.toString());
                    self.$nextTick(()=> {
                        self.$emit("WorkComplete");
                    });
                    self.isWorking = false;
                }
            }
            self.factorTick(quotient).then(val=>{
                factor = val;
                self.timeoutQueue(setTimeout(function(){
                    tick();
                },0));
            });

        }
    }
}
</script>
<style lang="scss">
.factor-widget {
    display: flex;
    align-items: center;
    justify-content: center;
    .outer {
        width : 100%;
    }
    .input-form {
        text-align: center;
        width: 100%;
        input {
            width: 100%;
        }
    }
    .intro {
        font-size: 18pt;
    }
    .col-inner {
        height: 5em;
        display: flex;
        align-items: center;
        
    }
    .invalid {
        position: relative;
        bottom:0px;
        right:0px;
        font-size: 22pt;
        background-color:yellow;
    }
    .red-border {
        border-style: solid;
        border-color: red;
        box-shadow: 0 0 10px red;
        outline: none;
    }
}
</style>