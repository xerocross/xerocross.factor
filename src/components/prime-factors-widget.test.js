import { shallowMount, mount } from '@vue/test-utils';
import PrimeFactorsWidget from "./prime-factors-widget.vue";

let Worker = null;

function getPrimaryNumberInput (primeFactorsWidget) {
    return primeFactorsWidget.find(".primary-number-input");
}

function getFactorListOuter (primeFactorsWidget) {
    return primeFactorsWidget.find(".factors-list")
}

function getVisibleFactors (primeFactorsWidget) {
    let outer = getFactorListOuter(primeFactorsWidget);
    return outer.findAll(".factor-item");
}
function getIsWorkingMessage (primeFactorsWidget) {
    return primeFactorsWidget.find(".is-working-message");
}
beforeEach(()=> {
    localStorage.clear();
    Worker = () => {
        throw new Error("worker not defined");
    }
})

test("component will mount", () => {
    expect(()=>{
        shallowMount(PrimeFactorsWidget);
    }).not.toThrow();
});

test("primary number input exists", () => {
    let primeFactorsWidget = shallowMount(PrimeFactorsWidget);
    let numInput = getPrimaryNumberInput(primeFactorsWidget);
    expect(numInput.exists()).toBe(true);
});

test("negative integer invalid", () => {
    Worker = null;
    let primeFactorsWidget = shallowMount(PrimeFactorsWidget);
    let numInput = getPrimaryNumberInput(primeFactorsWidget);
    numInput.setValue("-2");
    expect(primeFactorsWidget.vm.invalidInput).toBe(false);
});

test("decimal input invalid", () => {
    Worker = null;
    let primeFactorsWidget = shallowMount(PrimeFactorsWidget);
    let numInput = getPrimaryNumberInput(primeFactorsWidget);
    numInput.setValue("2.3");
    expect(primeFactorsWidget.vm.invalidInput).toBe(false);
});

test("non-numeric input invalid", () => {
    Worker = null;
    let primeFactorsWidget = shallowMount(PrimeFactorsWidget);
    let numInput = getPrimaryNumberInput(primeFactorsWidget);
    numInput.setValue("2a");
    expect(primeFactorsWidget.vm.invalidInput).toBe(false);
});

test("initial input value is '0'", () => {
    let primeFactorsWidget = shallowMount(PrimeFactorsWidget);
    let numInput = getPrimaryNumberInput(primeFactorsWidget);
    expect(numInput.element.value).toBe("0");
});


test("during working, shows '(working)' message", (done) => {
    window.Worker = null;
    let primeFactorsWidget;
    primeFactorsWidget = mount(PrimeFactorsWidget, {});
    primeFactorsWidget.vm.pushFactor = function() {
        expect(getIsWorkingMessage(primeFactorsWidget).exists()).toBe(true);
        done();
    }
    let numInput = getPrimaryNumberInput(primeFactorsWidget);
    numInput.setValue("12");
});

test("input number 3 produces prime factors '(3)', worker disabled", (done) => {
    window.Worker = null;
    let primeFactorsWidget
    primeFactorsWidget = mount(PrimeFactorsWidget);
    primeFactorsWidget.vm.$on("WorkComplete", function() {
        let visibleFactors = getVisibleFactors(primeFactorsWidget);
        expect(visibleFactors.at(0).text()).toBe("(3)");
        expect(visibleFactors.length).toBe(1);
        done();
    })
    let numInput = getPrimaryNumberInput(primeFactorsWidget);
    numInput.setValue("3");
});

test("input number 12 produces prime factors '(2)(2)(3)', worker disabled", (done) => {
    window.Worker = null;
    let primeFactorsWidget
    primeFactorsWidget = mount(PrimeFactorsWidget);
    primeFactorsWidget.vm.$on("WorkComplete", function() {
        let visibleFactors = getVisibleFactors(primeFactorsWidget);
        expect(visibleFactors.at(0).text()).toBe("(2)");
        expect(visibleFactors.at(1).text()).toBe("(2)");
        expect(visibleFactors.at(2).text()).toBe("(3)");
        expect(visibleFactors.length).toBe(3);
        done();
    })
    let numInput = getPrimaryNumberInput(primeFactorsWidget);
    numInput.setValue("12");
});

test("input number 5562 produces prime factors '(2)(3)(3)(3)(103)', worker disabled", (done) => {
    window.Worker = null;
    let primeFactorsWidget
    primeFactorsWidget = mount(PrimeFactorsWidget);
    primeFactorsWidget.vm.$on("WorkComplete", function() {
        let visibleFactors = getVisibleFactors(primeFactorsWidget);
        expect(visibleFactors.at(0).text()).toBe("(2)");
        expect(visibleFactors.at(1).text()).toBe("(3)");
        expect(visibleFactors.at(2).text()).toBe("(3)");
        expect(visibleFactors.at(3).text()).toBe("(3)");
        expect(visibleFactors.at(4).text()).toBe("(103)");
        expect(visibleFactors.length).toBe(5);
        done();
    })
    let numInput = getPrimaryNumberInput(primeFactorsWidget);
    numInput.setValue("5562");
});


test("mount with worker emits message WORKER OBJECT FOUND", (done) => {
    Worker = function() {
        this.onmessage = () => {};
        this.postMessage = () => {
        }
    }
    let primeFactorsWidget = mount(PrimeFactorsWidget, {
        propsData : {
            worker : new Worker()
        }
    });

    primeFactorsWidget.vm.$on("WORKER OBJECT FOUND", () => {
        expect(primeFactorsWidget.emitted()["WORKER OBJECT FOUND"].length).toBe(1);
        done();
    })
    primeFactorsWidget.vm.$on("WORKER OBJECT NOT FOUND", () => {
        expect(true).toBe(false);
        done();
    })
    let numInput = getPrimaryNumberInput(primeFactorsWidget);
    numInput.setValue("12");
});

test("mount without worker emits message WORKER OBJECT NOT FOUND", (done) => {
    let primeFactorsWidget = mount(PrimeFactorsWidget, {
        propsData : {
        }
    });
    primeFactorsWidget.vm.$on("WORKER OBJECT FOUND", () => {
        expect(true).toBe(false);
    })
    primeFactorsWidget.vm.$on("WORKER OBJECT NOT FOUND", () => {
        done();
    })
    let numInput = getPrimaryNumberInput(primeFactorsWidget);
    numInput.setValue("12");
});

test("response from worker gets added to view (12)", (done) => {
    let index = 0;

    Worker = function() {
        this.onmessage = () => {};
        this.postMessage = () => {
            switch (index) {
            case 0:
                this.onmessage({data : "2"});
                break;
            case 1:
                this.onmessage({data : "2"});
                break;
            case 2:
                this.onmessage({data : "3"});
                break;
            }
            index++;
        }
    }
    let myWorker = new Worker();
    let primeFactorsWidget
    primeFactorsWidget = mount(PrimeFactorsWidget, {
        propsData : {
            worker : myWorker
        }
    });
    primeFactorsWidget.vm.$on("WorkComplete", function() {
        let visibleFactors = getVisibleFactors(primeFactorsWidget);
        expect(visibleFactors.at(0).text()).toBe("(2)");
        expect(visibleFactors.at(1).text()).toBe("(2)");
        expect(visibleFactors.at(2).text()).toBe("(3)");
        expect(visibleFactors.length).toBe(3);
        done();
    })
    let numInput = getPrimaryNumberInput(primeFactorsWidget);
    numInput.setValue("12");
});

test("response from worker gets added to view (14)", (done) => {
    let index = 0;

    Worker = function() {
        this.onmessage = () => {};
        this.postMessage = () => {
            switch (index) {
            case 0:
                this.onmessage({data : "2"});
                break;
            case 1:
                this.onmessage({data : "7"});
                break;
            }
            index++;
        }
    }
    let myWorker = new Worker();
    let primeFactorsWidget
    primeFactorsWidget = mount(PrimeFactorsWidget, {
        propsData : {
            worker : myWorker
        }
    });
    primeFactorsWidget.vm.$on("WorkComplete", function() {
        let visibleFactors = getVisibleFactors(primeFactorsWidget);
        expect(visibleFactors.at(0).text()).toBe("(2)");
        expect(visibleFactors.at(1).text()).toBe("(7)");
        expect(visibleFactors.length).toBe(2);
        done();
    })
    let numInput = getPrimaryNumberInput(primeFactorsWidget);
    numInput.setValue("12");
});