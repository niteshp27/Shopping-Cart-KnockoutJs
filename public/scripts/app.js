$(document).ready(function () {

    var shouter = new ko.subscribable();

    var cakeItems ='[{"cakeid": 1,"title": "cake 1","description": "Cake 1 description","image": "image1","quantity": 2,"text": "Add to cart","price": 50,"totalprice": null},{"cakeid": 2,"title": "cake 2","description": "Cake 2 description","image": "image2","quantity": 1,"text": "Add to cart","price": 50,"totalprice": null},{"cakeid": 3,"title": "cake 3","description": "Cake 3 description","image": "image3","quantity": 1,"text": "Add to cart","price": 50,"totalprice": null},{"cakeid": 4,"title": "cake 4","description": "Cake 4 description","image": "image4","quantity": 1,"text": "Add to cart","price": 50,"totalprice": null}]';

    cakeItems = ko.utils.parseJson(cakeItems);
    var app = {};
    app.models = {};
    app.viewModels = {};
    var shouter = new ko.subscribable();

    app.models.cakeitemsmodel = function (data) {
        //data = ko.tojs(data) || {};
        console.log("In model.1" + ko.toJS(data.title));
        var self = this;
        self.cakeid = ko.observable(data.cakeid ? data.cakeid : "");
        self.title = ko.observable(data.title ? data.title : "");
        self.description = ko.observable(data.description ? data.description : "");
        self.image = ko.observable(data.image ? data.image : "");
        self.quantity = ko.observable(data.quantity ? data.quantity : "");
        self.text = ko.observable(data.text ? data.text : "");
        self.price = ko.observable(data.price ? data.price : "");
        self.totalprice = ko.pureComputed(function () {
            return (self.price() * self.quantity());
        });
        self.totalprice.subscribe(function (newValue) {
            shouter.notifySubscribers(newValue, "newItemPrice");
        });

    };

    app.viewModels.cakeItemViewmodel = function () {
        var self = this;
        self.cakeList = ko.observableArray(
            ko.utils.arrayMap(cakeItems, function (cakeItem) {
                console.log(cakeItem);
                return new app.models.cakeitemsmodel(cakeItem);
            }));
        self.cartList = ko.observableArray();
        self.subTotal = ko.observable(0);
        self.updateSubTotal = ko.observable(0);
        self.updateSubTotal = ko.computed(function () {
            return(self.cartList().length > 0);
        }); 

        self.cartList.subscribe(
            function (newValue) {
                console.log("subscribe" + newValue);
                function calculateSubTotal(element, index, array) {
                    console.log('a[' + index + '] = ' + element);
                    if (element.status === 'added') {
                        //console.log("Added or removed! The added/removed element is:", ko.toJSON(element));
                        var total = 20;
                        total = parseFloat(ko.utils.unwrapObservable(self.subTotal())) + parseFloat(ko.utils.unwrapObservable(element.value.totalprice()));
                        self.subTotal(total);
                    }
                    else if (element.status === 'deleted') {
                       var total = 0;
                       total = parseFloat(ko.utils.unwrapObservable(self.subTotal())) - parseFloat(ko.utils.unwrapObservable(element.value.totalprice()));
                       self.subTotal(total);
                    }
                }
                newValue.forEach(calculateSubTotal);
            }, null, "arrayChange");

        self.subTotal.subscribe(function (newValue) {
            shouter.notifySubscribers(newValue, "subTotalValue");
        });

        shouter.subscribe(function (newValue) {

            var total = 0;
            for (var i = 0; i < self.cartList().length; i++) {
                total += self.cartList()[i].totalprice();
            }
            console.log("New Total:", total);
            self.subTotal(total);
        }, this, "newItemPrice");
        
        self.addToCart = function (value, ele) {
            console.log(value+":"+ele);

            var cakeItem = new app.models.cakeitemsmodel(ko.toJS(value));
            self.cartList.push(cakeItem);
            //ele.currentTarget.innerText = "Already in cart";
            //console.log(ko.toJS(cakeItem));
            //console.log("::");
            console.log(ko.toJS(self.cartList));
        };
        self.removeFromCart = function (value, ele) {
            var eleId = value.cakeid();
            //$(eleId).innerText("Add to cart");
            console.log("ele attr get and set.");
            //$(eleId).text("Add to cart");
            self.cartList.remove(value);

        };

    };
    app.viewModels.cartItemViewmodel = function () {
        var self = this;
        self.orderTotal = ko.observable(0);
        self.orderTotal.extend({ notify: 'always' });

        shouter.subscribe(function (newValue) {
            self.orderTotal(newValue);
        }, this, "subTotalValue");



    };

    app.utilities = (function ($, ko) {
        function applyTemplate(vmInst, ele) {
            var jqEle = $(ele)[0];
            if (jqEle !== undefined) {
                ko.cleanNode(jqEle);
                ko.applyBindings(vmInst, jqEle);
            }
            else {
                ko.applyBindings(vmInst);
            }
        };
        function _init() {
            var cakeListInst = new app.viewModels.cakeItemViewmodel();
            app.utilities.applyTemplate(cakeListInst, "#left-side");
            app.utilities.applyTemplate(cakeListInst, "#right-side");
            
            var cartListInst = new app.viewModels.cartItemViewmodel();
            app.utilities.applyTemplate(cartListInst, "#right-bottom-side");
            //var mainVM = (function () {
            //    var self = this;
            //    self.cakeListInst = new app.viewModels.cakeItemViewmodel();
            //    self.cartListInst = new app.viewModels.cartItemViewmodel();
            //})();
            //ko.applyBindings(mainVM);

        };
        return {
            applyTemplate: applyTemplate,
            init: _init

        };
    })($, ko);

    app.utilities.init();

});