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

            var dateIndexOf = function (dates, needle) {
                for (var i = 0, max = dates.length ; i < max ; i++) {
                    var date = dates[i];

                    if (date.getFullYear() !== needle.getFullYear()) {
                        continue;
                    }
                    if (date.getMonth() !== needle.getMonth()) {
                        continue;
                    }
                    if (date.getDate() !== needle.getDate()) {
                        continue;
                    }

                    return i;
                }

                return -1;
            };

            var datepickerDelegate = function ($delegate, $parse) {
                var directive = $delegate[0];

                // Override compile
                var link = directive.link;

                directive.compile = function () {
                    return function (scope, element, attrs, ctrls) {
                        link.apply(this, arguments);

                        if (!angular.isDefined(attrs.multiSelect)) return;

                        var model = $parse(attrs.multiSelect);
                        scope.getSelectedDates = function () {
                            return model(scope.$parent);
                        };
                        scope.setSelectedDates = function (dates) {
                            return model.assign(dates);
                        };

                        // override for clearing dates
                        var select_origin = scope.select;
                        scope.select = function (date) {
                            select_origin(date);
                            if (date) {
                                return;
                            }

                            // clear all dates in multiSelectModel
                            var selectedDates = scope.getSelectedDates();
                            selectedDates.splice(0, selectedDates.length);
                            scope.setSelectedDates(selectedDates);
                        };

                        scope.$on('select_date', function () {
                            var newVal = scope.$parent.$eval(attrs.ngModel);
                            if (!newVal) {
                                return;
                            }

                            newVal.setHours(0, 0, 0, 0);

                            var selectedDates = scope.getSelectedDates();
                            var index = dateIndexOf(selectedDates, newVal);

                            if (index >= 0) {
                                selectedDates.splice(index, 1);
                            } else {
                                selectedDates.push(newVal);
                            }

                            scope.setSelectedDates(selectedDates);
                            scope.$broadcast('update_dates');
                        });
                    }
                };

                return $delegate;
            };

            if ($injector.has('uibDatepickerPopupDirective')) {
                $provide.decorator('uibDatepickerPopupDirective', ['$delegate', '$parse', datepickerDelegate]);
            }

            var daypickerDelegate = function ($delegate) {
                var directive = $delegate[0];

                // Override compile
                var link = directive.link;

                directive.compile = function () {
                    return function (scope, element, attrs, ctrls) {
                        link.apply(this, arguments);

                        if (!angular.isDefined(scope.$parent.$parent.getSelectedDates)) return;

                        // override for emitting a event chain
                        // emit 'select_date' -> broadcast 'update_dates'
                        var select_origin = scope.select;
                        scope.select = function (date) {
                            select_origin(date);
                            scope.$emit('select_date');
                        };
                        scope.$on('update_dates', update);

                        // fire when init rendering and moving to each months
                        var ctrl = angular.isArray(ctrls) ? ctrls[0] : ctrls;

                        scope.$watch(function () {
                            return ctrl.activeDate.getTime();
                        }, update);

                        function update() {
                            if (!scope.$parent || !scope.$parent.$parent) {
                                return;
                            }

                            var selectedDates = scope.$parent.$parent.getSelectedDates();
                            if (!selectedDates) {
                                return;
                            }

                            angular.forEach(scope.rows, function (row) {
                                angular.forEach(row, function (day) {
                                    var index = dateIndexOf(selectedDates, day.date);
                                    day.selected = index >= 0;
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
