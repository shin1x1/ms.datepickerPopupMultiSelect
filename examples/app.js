(function(angular) {
    'use strict';

    angular.module('app', ['ms.datepickerPopupMultiSelect'])
        .controller('AppCtrl', function() {
            this.activeDate = null;
            this.selectedDates = [];

            this.isOpen = false;
            this.open = function () {
                this.isOpen = true;
            };

            this.activeDate2 = null;
            this.isOpen2 = false;
            this.open2 = function () {
                this.isOpen2 = true;
            }
        });
})(window.angular);