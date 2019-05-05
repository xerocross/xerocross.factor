import Vue from "vue";
import PrimeFactorsWidget from "./components/prime-factors-widget.vue";

const myWorker = new Worker("/js/get-factor-worker.js");

new Vue({
    el : "#factor-primes",
    components : {
        PrimeFactorsWidget
    },
    render : function (createElement) {
        return createElement(PrimeFactorsWidget, {
            props : {
                worker : myWorker
            }
        });
    }
});