/*
 The MIT License (MIT)

 Copyright (c) 2014 Gregory McGee
 Copyright (c) 2016 Masashi Shinbara

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

(function (angular) {
    'use strict';

    angular.module('ms.datepickerPopupMultiSelect', ['ui.bootstrap'])
        .config(['$provide', '$injector', function ($provide, $injector) {

            // extending datepicker (access to attributes and app scope through $parent)
            var datepickerDelegate = function ($delegate) {
                var directive = $delegate[0];

                // Override compile
                var link = directive.link;

                directive.compile = function () {
                    return function (scope, element, attrs, ctrls) {
                        link.apply(this, arguments);

                        if (!angular.isDefined(attrs.multiSelect)) return;

                        scope.selectedDates = [];

                        scope.$parent.$watchCollection(attrs.multiSelect, function (newVal) {
                            scope.selectedDates = newVal || [];
                        });

                        scope.$on('select_date', function () {
                            var newVal = scope.$parent.$eval(attrs.ngModel);
                            if (!newVal)
                                return;

                            var dateVal = newVal.setHours(0, 0, 0, 0),
                                selectedDates = scope.selectedDates;

                            if (selectedDates.indexOf(dateVal) < 0) {
                                selectedDates.push(dateVal);
                            } else {
                                selectedDates.splice(selectedDates.indexOf(dateVal), 1);
                            }
                        });
                    }
                };

                return $delegate;
            };

            if ($injector.has('uibDatepickerPopupDirective')) {
                $provide.decorator('uibDatepickerPopupDirective', ['$delegate', datepickerDelegate]);
            }

            // extending daypicker (access to day and datepicker scope through $parent)
            var daypickerDelegate = function ($delegate) {
                var directive = $delegate[0];

                // Override compile
                var link = directive.link;

                directive.compile = function () {
                    return function (scope, element, attrs, ctrls) {
                        link.apply(this, arguments);

                        if (!angular.isDefined(scope.$parent.$parent.selectedDates)) return;

                        scope.$parent.$parent.$watchCollection('selectedDates', update);

                        var select_origin = scope.select;
                        scope.select = function (date) {
                            select_origin(date);
                            scope.$emit('select_date');
                            update();
                        };

                        function update() {
                            angular.forEach(scope.rows, function (row) {
                                if (!scope.$parent) {
                                    return;
                                }
                                angular.forEach(row, function (day) {
                                    day.selected = scope.$parent.$parent.selectedDates.indexOf(day.date.setHours(0, 0, 0, 0)) > -1
                                });
                            });
                        }
                    }
                };

                return $delegate;
            };

            if ($injector.has('uibDaypickerDirective')) {
                $provide.decorator('uibDaypickerDirective', ['$delegate', daypickerDelegate]);
            }
        }]);
})(window.angular);
