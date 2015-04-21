
/*
    angular-moment-datetimepicker

    A highly extensible date time picker directive.
 */

(function() {
  var module;

  module = angular.module('ui.bootstrap.moment.datetimepicker', []);

  module.constant('dateTimePickerConfig', {
    year: {
      format: 'YYYY',
      first: function(date) {
        return date.year(parseInt(date.year() / 10, 10) * 10);
      },
      amount: 12,
      line: moment.duration(4, 'year'),
      step: moment.duration(1, 'year'),
      previous: moment.duration(-10, 'year'),
      next: moment.duration(10, 'year')
    },
    month: {
      format: 'MMM YY',
      first: function(date) {
        return date.month(0);
      },
      amount: 12,
      line: moment.duration(4, 'month'),
      step: moment.duration(1, 'month'),
      previous: moment.duration(-1, 'year'),
      next: moment.duration(1, 'year')
    },
    day: {
      format: 'D',
      first: function(date) {
        date.date(1);
        return date.subtract(Math.abs(date.weekday()), 'days');
      },
      compare: function(a, b) {
        return (moment(a).month() + 1) - (moment(b).month() + 1);
      },
      amount: 42,
      line: moment.duration(7, 'day'),
      step: moment.duration(1, 'day'),
      previous: moment.duration(-1, 'month'),
      next: moment.duration(1, 'month')
    },
    hour: {
      format: 'hh:mm',
      first: function(date) {
        return date.hours(0).minutes(0);
      },
      amount: 24,
      line: moment.duration(4, 'hour'),
      step: moment.duration(1, 'hour'),
      previous: moment.duration(-1, 'day'),
      next: moment.duration(1, 'day')
    },
    minute: {
      format: 'hh:mm',
      first: function(date) {
        return date.hours(0).minutes(0);
      },
      amount: 24,
      line: moment.duration(2, 'hour'),
      step: moment.duration(15, 'minute'),
      previous: moment.duration(-1, 'hour'),
      next: moment.duration(1, 'hour')
    },
    second: {
      format: 'hh:mm:ss',
      first: function(date) {
        return date.hours(0).minutes(0).seconds(parseInt(date.seconds() / 15, 10) * 15);
      },
      amount: 4 * 3,
      line: moment.duration(20, 'second'),
      step: moment.duration(5, 'second'),
      previous: moment.duration(-1, 'hour'),
      next: moment.duration(1, 'hour')
    }
  });

  module.directive('momentDatetimepicker', [
    'dateTimePickerConfig', function(defaultConfig) {
      return {
        scope: {
          minDate: '=?',
          maxDate: '=?',
          view: '=?',
          tokens: '&',
          position: '=?',
          selected: '=?',
          hovered: '=?',
          activeBefore: '=?',
          activeAfter: '=?'
        },
        replace: true,
        link: function(scope, elm, attr) {
          var canNextView, canPreviousView, goDown, goLeft, goRight, goUp, nextViewValue, previousViewValue, splitByWeeks, steps, views;
          if (scope.view == null) {
            scope.view = 'year';
          }
          steps = defaultConfig;
          scope.tokens = scope.tokens() == null ? [
            {
              format: 'd',
              view: 'day'
            }, {
              format: '. '
            }, {
              format: 'MMMM',
              view: 'month'
            }, {
              format: ' '
            }, {
              format: 'yyyy',
              view: 'year'
            }
          ] : scope.tokens();
          goLeft = function() {
            return -steps[scope.view].step;
          };
          goRight = function() {
            return steps[scope.view].step;
          };
          goDown = function() {
            return steps[scope.view].line;
          };
          goUp = function() {
            return -steps[scope.view].line;
          };
          scope.keyPress = function($event) {
            var selected;
            selected = moment(scope.selected);
            switch ($event.keyCode) {
              case 39:
                return scope.select(selected.add(goRight()), $event);
              case 40:
                return scope.select(selected.add(goDown()), $event);
              case 37:
                return scope.select(selected.add(goLeft()), $event);
              case 38:
                return scope.select(selected.add(goUp()), $event);
              case 13:
                return scope.nextView($event);
              case 8:
                return scope.previousView($event);
              case 9:
                return angular.noop;
              case 27:
                return angular.noop;
            }
          };
          views = ['year', 'month', 'day', 'hour', 'minute', 'second'];
          scope.dow = moment.weekdaysShort();
          scope.hover = function(date, event) {
            if (event != null) {
              event.stopPropagation();
              event.preventDefault();
            }
            return scope.hovered = date.value != null ? moment(date.value).toDate() : moment(date).toDate();
          };
          scope.select = function(date, event) {
            if (event != null) {
              event.stopPropagation();
              event.preventDefault();
            }
            return scope.selected = date.value != null ? moment(date.value).toDate() : moment(date).toDate();
          };
          scope.next = function(event) {
            var date, offset;
            if (event != null) {
              event.stopPropagation();
              event.preventDefault();
            }
            date = moment(scope.selected);
            offset = steps[scope.view].next;
            date.add(offset);
            return scope.position = date.toDate();
          };
          scope.previous = function(event) {
            var date, offset;
            if (event != null) {
              event.stopPropagation();
              event.preventDefault();
            }
            date = moment(scope.selected);
            offset = steps[scope.view].previous;
            date.add(offset);
            return scope.position = date.toDate();
          };
          canNextView = function() {
            if (scope.maxDate == null) {
              return true;
            } else {
              return moment(scope.selected).add(steps[scope.view].next).isBefore(scope.maxDate);
            }
          };
          canPreviousView = function() {
            if (scope.minDate == null) {
              return true;
            } else {
              return moment(scope.selected).add(steps[scope.view].previous).isAfter(scope.minDate);
            }
          };
          splitByWeeks = function(steps) {
            var j, lastWeek, len, step, stepsByWeek, week;
            if (steps == null) {
              steps = [];
            }
            if (scope.steps == null) {
              return;
            }
            lastWeek = null;
            stepsByWeek = [];
            for (j = 0, len = steps.length; j < len; j++) {
              step = steps[j];
              week = moment(step.value).week();
              if (lastWeek !== week) {
                stepsByWeek.push([]);
                lastWeek = week;
              }
              stepsByWeek[stepsByWeek.length - 1].push(step);
            }
            return stepsByWeek;
          };
          scope.$watchGroup(['minDate', 'maxDate', 'steps'], function() {
            var afterMinimum, beforeMaximum, j, len, ref, results, step, stepDate;
            if (scope.steps == null) {
              return;
            }
            ref = scope.steps;
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
              step = ref[j];
              stepDate = moment(step.value);
              afterMinimum = scope.minDate != null ? stepDate.isAfter(scope.minDate, scope.view) : true;
              beforeMaximum = scope.maxDate != null ? stepDate.isBefore(scope.maxDate, scope.view) : true;
              results.push(step.selectable = afterMinimum && beforeMaximum);
            }
            return results;
          });
          scope.$watch('activeBefore + activeAfter + steps.length', function() {
            var isAfter, isBefore, j, len, ref, results, step, stepDate;
            if (scope.steps == null) {
              return;
            }
            ref = scope.steps;
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
              step = ref[j];
              stepDate = moment(step.value);
              if ((scope.activeBefore == null) && (scope.activeAfter == null)) {
                results.push(step.active = false);
              } else {
                if (scope.activeBefore != null) {
                  isBefore = stepDate.isBefore(scope.activeBefore, scope.view) || stepDate.isSame(scope.activeBefore, scope.view);
                } else {
                  isBefore = true;
                }
                if (scope.activeAfter != null) {
                  isAfter = stepDate.isAfter(scope.activeAfter, scope.view) || stepDate.isSame(scope.activeAfter, scope.view);
                } else {
                  isAfter = true;
                }
                results.push(step.active = isBefore && isAfter);
              }
            }
            return results;
          });
          scope.$watch('selected + steps.length', function() {
            var j, len, ref, step;
            if (scope.steps == null) {
              return;
            }
            ref = scope.steps;
            for (j = 0, len = ref.length; j < len; j++) {
              step = ref[j];
              step.selected = moment(step.value).isSame(scope.selected, scope.view);
            }
            scope.$canNext = canNextView();
            return scope.$canPrevious = canPreviousView();
          });
          scope.$watch('position + view', function() {
            var amount, currentStep, i, period, step, stepDate;
            step = steps[scope.view];
            stepDate = step.first(moment(scope.position));
            period = step.step;
            amount = step.amount;
            scope.steps = (function() {
              var j, ref, results;
              results = [];
              for (i = j = 0, ref = amount - 1; j <= ref; i = j += 1) {
                currentStep = {
                  past: step.compare(stepDate, scope.position) < 0,
                  future: step.compare(stepDate, scope.position) > 0,
                  formatted: moment(stepDate).format(step.format),
                  value: moment(stepDate).toDate()
                };
                stepDate.add(period);
                results.push(currentStep);
              }
              return results;
            })();
            if (scope.view === 'day') {
              scope.byWeeks = splitByWeeks(scope.steps);
            }
          });
          nextViewValue = function(view) {
            var index;
            index = views.indexOf(view);
            if (index === -1) {
              throw new Error("The view \"" + view + "\" is invalid");
            } else {
              if (index++ < views.length) {
                return views[index];
              } else {
                return views.slice(-1);
              }
            }
          };
          scope.nextView = function(event) {
            if (event != null) {
              event.stopPropagation();
              event.preventDefault();
            }
            return scope.switchView(nextViewValue(scope.view));
          };
          previousViewValue = function(view) {
            var index;
            index = views.indexOf(view);
            if (index === -1) {
              throw new Error("The view \"" + view + "\" is invalid");
            } else {
              if (index-- > 0) {
                return views[index];
              } else {
                return views[0];
              }
            }
          };
          scope.previousView = function(event) {
            if (event != null) {
              event.stopPropagation();
              event.preventDefault();
            }
            return scope.switchView(previousViewValue(scope.view));
          };
          return scope.switchView = function(view, event) {
            if (event != null) {
              event.stopPropagation();
              event.preventDefault();
            }
            return scope.view = view;
          };
        },
        restrict: 'E',
        template: "<div ng-keydown=\"keyPress($event)\" class=\"datetimepicker table-responsive\">\n<table  class=\"table {{ view }}-view\">\n   <thead>\n       <tr>\n           <th class=\"left\" data-ng-click=\"previous($event)\" data-ng-show=\"$canPrevious\"><i class=\"glyphicon glyphicon-arrow-left\"/></th>\n           <th class=\"switch\" colspan=\"5\" data-ng-click=\"previousView($event)\">\n               <span ng-repeat=\"token in tokens\" class=\"{{ token.view }} {{ token.view === view && 'current' || '' }} \" >\n                 <a ng-if=\"token.view\" ng-click=\"switchView(token.view, $event)\">{{ position | date:token.format }}</a>\n                 <span ng-if=\"!token.view\">{{ token.value }}</span>\n               </span>\n           </th>\n           <th class=\"right\" data-ng-click=\"next($event)\" data-ng-show=\"$canNext\"><i class=\"glyphicon glyphicon-arrow-right\"/></th>\n       </tr>\n       <tr data-ng-show=\"view === 'day'\">\n           <th class=\"dow\" data-ng-repeat=\"day in dow\" >{{ day }}</th>\n       </tr>\n   </thead>\n   <tbody>\n       <tr data-ng-if=\"view !== 'day'\" >\n           <td colspan=\"7\" >\n              <span    class=\"{{ view }}\"\n                       data-ng-repeat=\"step in steps\"\n                       data-ng-class=\"{active: step.active, past: step.past, future: step.future, disabled: !step.selectable}\"\n                       data-ng-click=\"select(step,$event)\"\n                       data-ng-mouseenter=\"hover(step,$event)\">{{ step.formatted }}</span>\n           </td>\n       </tr>\n       <tr data-ng-if=\"view === 'day'\" data-ng-repeat=\"weeks in byWeeks\">\n           <td data-ng-repeat=\"step in weeks\"\n               data-ng-click=\"select(step,$event)\"\n               data-ng-mouseenter=\"hover(step,$event)\"\n               class=\"day\"\n             data-ng-class=\"{active: step.active, past: step.past, future: step.future, disabled: !step.selectable}\">{{ step.formatted }}</td>\n       </tr>\n   </tbody>\n</table>\n</div>"
      };
    }
  ]);


  /*
      A directive that allow the selection of two datetime values.
   */

  module.directive('periodDatetimePicker', [
    'dateTimePickerConfig', function(defaultConfig) {
      return {
        scope: {
          minDate: '=?',
          maxDate: '=?',
          view: '=?',
          tokens: '&',
          position: '=?',
          from: "=",
          to: "="
        },
        replace: true,
        link: function(scope, elm, attr) {
          var changeRange, selecting, viewsSteps;
          scope.tokens = scope.tokens() == null ? {
            day: [
              {
                format: 'MMMM',
                view: 'month'
              }, {
                format: ' '
              }, {
                format: 'yyyy',
                view: 'year'
              }
            ],
            month: [
              {
                format: 'MMMM',
                view: 'month'
              }, {
                format: ' '
              }, {
                format: 'yyyy',
                view: 'year'
              }
            ]
          } : scope.tokens();
          scope.left = scope.middle = scope.right = null;
          if (scope.position == null) {
            scope.leftPos = scope.middlePos = scope.leftPos = moment().toDate();
          }
          scope.hovered = null;
          scope.view = 'day';
          scope.laa = scope.lab = scope.maa = scope.mab = scope.raa = scope.rab = null;
          scope.$watch('from + to + position', function() {
            var from, ref, to;
            if (!((scope.from != null) && (scope.to != null))) {
              return;
            }
            from = moment(scope.from);
            to = moment(scope.to);
            if (to < from) {
              ref = [to, from], from = ref[0], to = ref[1];
            }
            scope.rab = scope.mab = scope.lab = to.toDate();
            return scope.raa = scope.maa = scope.laa = from.toDate();
          });
          viewsSteps = {
            minute: {
              duration: moment.duration(12, 'hour'),
              step: moment.duration(4, 'hour')
            },
            hour: {
              duration: moment.duration(24, 'hour'),
              step: moment.duration(8, 'hour')
            },
            day: {
              duration: moment.duration(3, 'month'),
              step: moment.duration(1, 'month')
            },
            month: {
              duration: moment.duration(12, 'month'),
              step: moment.duration(4, 'month')
            },
            year: {
              duration: moment.duration(100, 'year'),
              step: moment.duration(4, 'month')
            }
          };
          scope.$watch('position + view', function() {
            scope.leftPos = moment(moment(scope.position) - (2 * viewsSteps[scope.view].step)).toDate();
            scope.middlePos = moment(moment(scope.position) - (1 * viewsSteps[scope.view].step)).toDate();
            return scope.rightPos = moment(moment(scope.position) - (0 * viewsSteps[scope.view].step)).toDate();
          });
          scope.$next = function() {
            return scope.position = moment(moment(scope.position) + viewsSteps[scope.view].step).toDate();
          };
          scope.$previous = function() {
            return scope.position = moment(moment(scope.position) - viewsSteps[scope.view].step).toDate();
          };
          selecting = null;
          changeRange = function(newDate) {
            if (selecting == null) {
              scope.from = newDate;
              scope.to = null;
              return selecting = scope.$watch('hover', function(newDate) {
                return scope.to = moment(newDate).toDate();
              });
            } else {
              selecting();
              return selecting = null;
            }
          };
          scope.$watch('left', changeRange);
          scope.$watch('middle', changeRange);
          return scope.$watch('right', changeRange);
        },
        restrict: 'E',
        template: "<div class='period-picker'>\n  <div class=\"previous-btn\" ng-click=\"$previous()\">\n    <a>previous</a>\n  </div>\n  <div class=\"pickers\">\n    <div class='picker left'>\n      <moment-datetimepicker selected=\"left\"\n                             position=\"leftPos\"\n                             view=\"view\"\n                             active-before=\"lab\"\n                             active-after=\"laa\"\n                             hovered=\"hover\"\n                             min-date=\"min\"\n                             max-date=\"max\">\n      </moment-datetimepicker>\n    </div>\n    <div class='picker middle'>\n      <moment-datetimepicker selected=\"right\"\n                             position=\"middlePos\"\n                             view=\"view\"\n                             active-before=\"rab\"\n                             active-after=\"raa\"\n                             hovered=\"hover\"\n                             min-date=\"min\"\n                             max-date=\"max\">\n    </div>\n    <div class='picker right'>\n      <moment-datetimepicker selected=\"middle\"\n                             position=\"rightPos\"\n                             view=\"view\"\n                             active-before=\"mab\"\n                             active-after=\"maa\"\n                             hovered=\"hover\"\n                             min-date=\"min\"\n                             max-date=\"max\">\n      </moment-datetimepicker>\n    </div>\n  </div>\n  <div class=\"next-btn\" ng-click=\"$next()\">\n    <a>next</a>\n  </div>\n</div>"
      };
    }
  ]);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuZ3VsYXItbW9tZW50LXRpbWVwaWNrZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUE7Ozs7R0FBQTtBQUFBO0FBQUE7QUFBQSxNQUFBLE1BQUE7O0FBQUEsRUFLQSxNQUFBLEdBQVMsT0FBTyxDQUFDLE1BQVIsQ0FBZSxvQ0FBZixFQUFxRCxFQUFyRCxDQUxULENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsUUFBUCxDQUFnQixzQkFBaEIsRUFBd0M7QUFBQSxJQUN0QyxJQUFBLEVBQ0U7QUFBQSxNQUFBLE1BQUEsRUFBUSxNQUFSO0FBQUEsTUFDQSxLQUFBLEVBQU8sU0FBQyxJQUFELEdBQUE7ZUFDTCxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQUEsQ0FBUyxJQUFJLENBQUMsSUFBTCxDQUFBLENBQUEsR0FBYyxFQUF2QixFQUEyQixFQUEzQixDQUFBLEdBQWlDLEVBQTNDLEVBREs7TUFBQSxDQURQO0FBQUEsTUFHQSxNQUFBLEVBQVEsRUFIUjtBQUFBLE1BSUEsSUFBQSxFQUFNLE1BQU0sQ0FBQyxRQUFQLENBQWdCLENBQWhCLEVBQW1CLE1BQW5CLENBSk47QUFBQSxNQUtBLElBQUEsRUFBTSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFoQixFQUFtQixNQUFuQixDQUxOO0FBQUEsTUFNQSxRQUFBLEVBQVUsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBQSxFQUFoQixFQUFxQixNQUFyQixDQU5WO0FBQUEsTUFPQSxJQUFBLEVBQU0sTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsRUFBaEIsRUFBb0IsTUFBcEIsQ0FQTjtLQUZvQztBQUFBLElBVXRDLEtBQUEsRUFDRTtBQUFBLE1BQUEsTUFBQSxFQUFRLFFBQVI7QUFBQSxNQUNBLEtBQUEsRUFBTyxTQUFDLElBQUQsR0FBQTtlQUNMLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxFQURLO01BQUEsQ0FEUDtBQUFBLE1BR0EsTUFBQSxFQUFRLEVBSFI7QUFBQSxNQUlBLElBQUEsRUFBTSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFoQixFQUFtQixPQUFuQixDQUpOO0FBQUEsTUFLQSxJQUFBLEVBQU0sTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsT0FBbkIsQ0FMTjtBQUFBLE1BTUEsUUFBQSxFQUFVLE1BQU0sQ0FBQyxRQUFQLENBQWdCLENBQUEsQ0FBaEIsRUFBb0IsTUFBcEIsQ0FOVjtBQUFBLE1BT0EsSUFBQSxFQUFNLE1BQU0sQ0FBQyxRQUFQLENBQWdCLENBQWhCLEVBQW1CLE1BQW5CLENBUE47S0FYb0M7QUFBQSxJQW1CdEMsR0FBQSxFQUNFO0FBQUEsTUFBQSxNQUFBLEVBQVEsR0FBUjtBQUFBLE1BQ0EsS0FBQSxFQUFPLFNBQUMsSUFBRCxHQUFBO0FBQ0wsUUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLENBQVYsQ0FBQSxDQUFBO2VBQ0EsSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxPQUFMLENBQUEsQ0FBVCxDQUFkLEVBQXdDLE1BQXhDLEVBRks7TUFBQSxDQURQO0FBQUEsTUFJQSxPQUFBLEVBQVMsU0FBQyxDQUFELEVBQUksQ0FBSixHQUFBO2VBQ1AsQ0FBQyxNQUFBLENBQU8sQ0FBUCxDQUFTLENBQUMsS0FBVixDQUFBLENBQUEsR0FBb0IsQ0FBckIsQ0FBQSxHQUEwQixDQUFDLE1BQUEsQ0FBTyxDQUFQLENBQVMsQ0FBQyxLQUFWLENBQUEsQ0FBQSxHQUFvQixDQUFyQixFQURuQjtNQUFBLENBSlQ7QUFBQSxNQU1BLE1BQUEsRUFBUSxFQU5SO0FBQUEsTUFPQSxJQUFBLEVBQU0sTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsS0FBbkIsQ0FQTjtBQUFBLE1BUUEsSUFBQSxFQUFNLE1BQU0sQ0FBQyxRQUFQLENBQWdCLENBQWhCLEVBQW1CLEtBQW5CLENBUk47QUFBQSxNQVNBLFFBQUEsRUFBVSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFBLENBQWhCLEVBQW9CLE9BQXBCLENBVFY7QUFBQSxNQVVBLElBQUEsRUFBTSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFoQixFQUFtQixPQUFuQixDQVZOO0tBcEJvQztBQUFBLElBK0J0QyxJQUFBLEVBQ0U7QUFBQSxNQUFBLE1BQUEsRUFBUSxPQUFSO0FBQUEsTUFDQSxLQUFBLEVBQU8sU0FBQyxJQUFELEdBQUE7ZUFDTCxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsQ0FBYSxDQUFDLE9BQWQsQ0FBc0IsQ0FBdEIsRUFESztNQUFBLENBRFA7QUFBQSxNQUdBLE1BQUEsRUFBUSxFQUhSO0FBQUEsTUFJQSxJQUFBLEVBQU0sTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsTUFBbkIsQ0FKTjtBQUFBLE1BS0EsSUFBQSxFQUFNLE1BQU0sQ0FBQyxRQUFQLENBQWdCLENBQWhCLEVBQW1CLE1BQW5CLENBTE47QUFBQSxNQU1BLFFBQUEsRUFBVSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFBLENBQWhCLEVBQW9CLEtBQXBCLENBTlY7QUFBQSxNQU9BLElBQUEsRUFBTSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFoQixFQUFtQixLQUFuQixDQVBOO0tBaENvQztBQUFBLElBd0N0QyxNQUFBLEVBQ0U7QUFBQSxNQUFBLE1BQUEsRUFBUSxPQUFSO0FBQUEsTUFDQSxLQUFBLEVBQU8sU0FBQyxJQUFELEdBQUE7ZUFDTCxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsQ0FBYSxDQUFDLE9BQWQsQ0FBc0IsQ0FBdEIsRUFESztNQUFBLENBRFA7QUFBQSxNQUdBLE1BQUEsRUFBUSxFQUhSO0FBQUEsTUFJQSxJQUFBLEVBQU0sTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsTUFBbkIsQ0FKTjtBQUFBLE1BS0EsSUFBQSxFQUFNLE1BQU0sQ0FBQyxRQUFQLENBQWdCLEVBQWhCLEVBQW9CLFFBQXBCLENBTE47QUFBQSxNQU1BLFFBQUEsRUFBVSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFBLENBQWhCLEVBQW9CLE1BQXBCLENBTlY7QUFBQSxNQU9BLElBQUEsRUFBTSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFoQixFQUFtQixNQUFuQixDQVBOO0tBekNvQztBQUFBLElBaUR0QyxNQUFBLEVBQ0U7QUFBQSxNQUFBLE1BQUEsRUFBUSxVQUFSO0FBQUEsTUFDQSxLQUFBLEVBQU8sU0FBQyxJQUFELEdBQUE7ZUFDTCxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsQ0FBYSxDQUFDLE9BQWQsQ0FBc0IsQ0FBdEIsQ0FBd0IsQ0FBQyxPQUF6QixDQUFpQyxRQUFBLENBQVMsSUFBSSxDQUFDLE9BQUwsQ0FBQSxDQUFBLEdBQWlCLEVBQTFCLEVBQThCLEVBQTlCLENBQUEsR0FBb0MsRUFBckUsRUFESztNQUFBLENBRFA7QUFBQSxNQUdBLE1BQUEsRUFBUSxDQUFBLEdBQUksQ0FIWjtBQUFBLE1BSUEsSUFBQSxFQUFNLE1BQU0sQ0FBQyxRQUFQLENBQWdCLEVBQWhCLEVBQW9CLFFBQXBCLENBSk47QUFBQSxNQUtBLElBQUEsRUFBTSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFoQixFQUFtQixRQUFuQixDQUxOO0FBQUEsTUFNQSxRQUFBLEVBQVUsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBQSxDQUFoQixFQUFvQixNQUFwQixDQU5WO0FBQUEsTUFPQSxJQUFBLEVBQU0sTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsTUFBbkIsQ0FQTjtLQWxEb0M7R0FBeEMsQ0FUQSxDQUFBOztBQUFBLEVBd0VBLE1BQU0sQ0FBQyxTQUFQLENBQWlCLHNCQUFqQixFQUF5QztJQUFDLHNCQUFELEVBQXlCLFNBQUMsYUFBRCxHQUFBO0FBQ2hFLGFBQU87QUFBQSxRQUNQLEtBQUEsRUFBTztBQUFBLFVBQ0wsT0FBQSxFQUFTLElBREo7QUFBQSxVQUVMLE9BQUEsRUFBUyxJQUZKO0FBQUEsVUFHTCxJQUFBLEVBQU0sSUFIRDtBQUFBLFVBSUwsTUFBQSxFQUFRLEdBSkg7QUFBQSxVQUtMLFFBQUEsRUFBVSxJQUxMO0FBQUEsVUFNTCxRQUFBLEVBQVUsSUFOTDtBQUFBLFVBT0wsT0FBQSxFQUFTLElBUEo7QUFBQSxVQVFMLFlBQUEsRUFBYyxJQVJUO0FBQUEsVUFTTCxXQUFBLEVBQWEsSUFUUjtTQURBO0FBQUEsUUFZUCxPQUFBLEVBQVMsSUFaRjtBQUFBLFFBYVAsSUFBQSxFQUFNLFNBQUMsS0FBRCxFQUFRLEdBQVIsRUFBYSxJQUFiLEdBQUE7QUFDSixjQUFBLHlIQUFBO0FBQUEsVUFBQSxJQUEyQixrQkFBM0I7QUFBQSxZQUFBLEtBQUssQ0FBQyxJQUFOLEdBQWEsTUFBYixDQUFBO1dBQUE7QUFBQSxVQUtBLEtBQUEsR0FBUSxhQUxSLENBQUE7QUFBQSxVQVFBLEtBQUssQ0FBQyxNQUFOLEdBQXNCLHNCQUFQLEdBQTRCO1lBQ3pDO0FBQUEsY0FBQyxNQUFBLEVBQVEsR0FBVDtBQUFBLGNBQWMsSUFBQSxFQUFNLEtBQXBCO2FBRHlDLEVBRXpDO0FBQUEsY0FBQyxNQUFBLEVBQVEsSUFBVDthQUZ5QyxFQUd6QztBQUFBLGNBQUMsTUFBQSxFQUFRLE1BQVQ7QUFBQSxjQUFpQixJQUFBLEVBQU0sT0FBdkI7YUFIeUMsRUFJekM7QUFBQSxjQUFDLE1BQUEsRUFBUSxHQUFUO2FBSnlDLEVBS3pDO0FBQUEsY0FBQyxNQUFBLEVBQVEsTUFBVDtBQUFBLGNBQWlCLElBQUEsRUFBTSxNQUF2QjthQUx5QztXQUE1QixHQU1SLEtBQUssQ0FBQyxNQUFOLENBQUEsQ0FkUCxDQUFBO0FBQUEsVUFvQkEsTUFBQSxHQUFTLFNBQUEsR0FBQTttQkFDUCxDQUFBLEtBQU8sQ0FBQSxLQUFLLENBQUMsSUFBTixDQUFXLENBQUMsS0FEWjtVQUFBLENBcEJULENBQUE7QUFBQSxVQXNCQSxPQUFBLEdBQVUsU0FBQSxHQUFBO21CQUNSLEtBQU0sQ0FBQSxLQUFLLENBQUMsSUFBTixDQUFXLENBQUMsS0FEVjtVQUFBLENBdEJWLENBQUE7QUFBQSxVQXdCQSxNQUFBLEdBQVMsU0FBQSxHQUFBO21CQUNQLEtBQU0sQ0FBQSxLQUFLLENBQUMsSUFBTixDQUFXLENBQUMsS0FEWDtVQUFBLENBeEJULENBQUE7QUFBQSxVQTBCQSxJQUFBLEdBQU8sU0FBQSxHQUFBO21CQUNMLENBQUEsS0FBTyxDQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBQyxLQURkO1VBQUEsQ0ExQlAsQ0FBQTtBQUFBLFVBNkJBLEtBQUssQ0FBQyxRQUFOLEdBQWlCLFNBQUMsTUFBRCxHQUFBO0FBQ2YsZ0JBQUEsUUFBQTtBQUFBLFlBQUEsUUFBQSxHQUFXLE1BQUEsQ0FBTyxLQUFLLENBQUMsUUFBYixDQUFYLENBQUE7QUFFQSxvQkFBTyxNQUFNLENBQUMsT0FBZDtBQUFBLG1CQUNPLEVBRFA7dUJBQ2UsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFRLENBQUMsR0FBVCxDQUFhLE9BQUEsQ0FBQSxDQUFiLENBQWIsRUFBc0MsTUFBdEMsRUFEZjtBQUFBLG1CQUVPLEVBRlA7dUJBRWUsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFRLENBQUMsR0FBVCxDQUFhLE1BQUEsQ0FBQSxDQUFiLENBQWIsRUFBcUMsTUFBckMsRUFGZjtBQUFBLG1CQUdPLEVBSFA7dUJBR2UsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFRLENBQUMsR0FBVCxDQUFhLE1BQUEsQ0FBQSxDQUFiLENBQWIsRUFBcUMsTUFBckMsRUFIZjtBQUFBLG1CQUlPLEVBSlA7dUJBSWUsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFRLENBQUMsR0FBVCxDQUFhLElBQUEsQ0FBQSxDQUFiLENBQWIsRUFBbUMsTUFBbkMsRUFKZjtBQUFBLG1CQUtPLEVBTFA7dUJBS2UsS0FBSyxDQUFDLFFBQU4sQ0FBZSxNQUFmLEVBTGY7QUFBQSxtQkFNTyxDQU5QO3VCQU1jLEtBQUssQ0FBQyxZQUFOLENBQW1CLE1BQW5CLEVBTmQ7QUFBQSxtQkFPTyxDQVBQO3VCQU9jLE9BQU8sQ0FBQyxLQVB0QjtBQUFBLG1CQVFPLEVBUlA7dUJBUWUsT0FBTyxDQUFDLEtBUnZCO0FBQUEsYUFIZTtVQUFBLENBN0JqQixDQUFBO0FBQUEsVUFtREEsS0FBQSxHQUFRLENBQ04sTUFETSxFQUNFLE9BREYsRUFDVyxLQURYLEVBRU4sTUFGTSxFQUVFLFFBRkYsRUFFWSxRQUZaLENBbkRSLENBQUE7QUFBQSxVQXdEQSxLQUFLLENBQUMsR0FBTixHQUFZLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0F4RFosQ0FBQTtBQUFBLFVBMERBLEtBQUssQ0FBQyxLQUFOLEdBQWMsU0FBQyxJQUFELEVBQU8sS0FBUCxHQUFBO0FBQ1osWUFBQSxJQUFHLGFBQUg7QUFDRSxjQUFBLEtBQUssQ0FBQyxlQUFOLENBQUEsQ0FBQSxDQUFBO0FBQUEsY0FDQSxLQUFLLENBQUMsY0FBTixDQUFBLENBREEsQ0FERjthQUFBO21CQUlBLEtBQUssQ0FBQyxPQUFOLEdBQW1CLGtCQUFILEdBQW9CLE1BQUEsQ0FBTyxJQUFJLENBQUMsS0FBWixDQUFrQixDQUFDLE1BQW5CLENBQUEsQ0FBcEIsR0FBcUQsTUFBQSxDQUFPLElBQVAsQ0FBWSxDQUFDLE1BQWIsQ0FBQSxFQUx6RDtVQUFBLENBMURkLENBQUE7QUFBQSxVQW9FQSxLQUFLLENBQUMsTUFBTixHQUFlLFNBQUMsSUFBRCxFQUFPLEtBQVAsR0FBQTtBQUNiLFlBQUEsSUFBRyxhQUFIO0FBQ0UsY0FBQSxLQUFLLENBQUMsZUFBTixDQUFBLENBQUEsQ0FBQTtBQUFBLGNBQ0EsS0FBSyxDQUFDLGNBQU4sQ0FBQSxDQURBLENBREY7YUFBQTttQkFJQSxLQUFLLENBQUMsUUFBTixHQUFvQixrQkFBSCxHQUFvQixNQUFBLENBQU8sSUFBSSxDQUFDLEtBQVosQ0FBa0IsQ0FBQyxNQUFuQixDQUFBLENBQXBCLEdBQXFELE1BQUEsQ0FBTyxJQUFQLENBQVksQ0FBQyxNQUFiLENBQUEsRUFMekQ7VUFBQSxDQXBFZixDQUFBO0FBQUEsVUErRUEsS0FBSyxDQUFDLElBQU4sR0FBYSxTQUFDLEtBQUQsR0FBQTtBQUNYLGdCQUFBLFlBQUE7QUFBQSxZQUFBLElBQUcsYUFBSDtBQUNFLGNBQUEsS0FBSyxDQUFDLGVBQU4sQ0FBQSxDQUFBLENBQUE7QUFBQSxjQUNBLEtBQUssQ0FBQyxjQUFOLENBQUEsQ0FEQSxDQURGO2FBQUE7QUFBQSxZQUlBLElBQUEsR0FBTyxNQUFBLENBQU8sS0FBSyxDQUFDLFFBQWIsQ0FKUCxDQUFBO0FBQUEsWUFLQSxNQUFBLEdBQVMsS0FBTSxDQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBQyxJQUwzQixDQUFBO0FBQUEsWUFNQSxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQsQ0FOQSxDQUFBO21CQU9BLEtBQUssQ0FBQyxRQUFOLEdBQWlCLElBQUksQ0FBQyxNQUFMLENBQUEsRUFSTjtVQUFBLENBL0ViLENBQUE7QUFBQSxVQTRGQSxLQUFLLENBQUMsUUFBTixHQUFpQixTQUFDLEtBQUQsR0FBQTtBQUNmLGdCQUFBLFlBQUE7QUFBQSxZQUFBLElBQUcsYUFBSDtBQUNFLGNBQUEsS0FBSyxDQUFDLGVBQU4sQ0FBQSxDQUFBLENBQUE7QUFBQSxjQUNBLEtBQUssQ0FBQyxjQUFOLENBQUEsQ0FEQSxDQURGO2FBQUE7QUFBQSxZQUlBLElBQUEsR0FBTyxNQUFBLENBQU8sS0FBSyxDQUFDLFFBQWIsQ0FKUCxDQUFBO0FBQUEsWUFLQSxNQUFBLEdBQVMsS0FBTSxDQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBQyxRQUwzQixDQUFBO0FBQUEsWUFNQSxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQsQ0FOQSxDQUFBO21CQU9BLEtBQUssQ0FBQyxRQUFOLEdBQWlCLElBQUksQ0FBQyxNQUFMLENBQUEsRUFSRjtVQUFBLENBNUZqQixDQUFBO0FBQUEsVUE4R0EsV0FBQSxHQUFjLFNBQUEsR0FBQTtBQUNaLFlBQUEsSUFBTyxxQkFBUDtBQUNFLHFCQUFPLElBQVAsQ0FERjthQUFBLE1BQUE7QUFHRSxxQkFBTyxNQUFBLENBQU8sS0FBSyxDQUFDLFFBQWIsQ0FBc0IsQ0FBQyxHQUF2QixDQUEyQixLQUFNLENBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFDLElBQTdDLENBQWtELENBQUMsUUFBbkQsQ0FBNEQsS0FBSyxDQUFDLE9BQWxFLENBQVAsQ0FIRjthQURZO1VBQUEsQ0E5R2QsQ0FBQTtBQUFBLFVBMkhBLGVBQUEsR0FBa0IsU0FBQSxHQUFBO0FBQ2hCLFlBQUEsSUFBTyxxQkFBUDtBQUNFLHFCQUFPLElBQVAsQ0FERjthQUFBLE1BQUE7QUFHRSxxQkFBTyxNQUFBLENBQU8sS0FBSyxDQUFDLFFBQWIsQ0FBc0IsQ0FBQyxHQUF2QixDQUEyQixLQUFNLENBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFDLFFBQTdDLENBQXNELENBQUMsT0FBdkQsQ0FBK0QsS0FBSyxDQUFDLE9BQXJFLENBQVAsQ0FIRjthQURnQjtVQUFBLENBM0hsQixDQUFBO0FBQUEsVUFvSUEsWUFBQSxHQUFlLFNBQUMsS0FBRCxHQUFBO0FBQ2IsZ0JBQUEseUNBQUE7O2NBRGMsUUFBUTthQUN0QjtBQUFBLFlBQUEsSUFBYyxtQkFBZDtBQUFBLG9CQUFBLENBQUE7YUFBQTtBQUFBLFlBRUEsUUFBQSxHQUFXLElBRlgsQ0FBQTtBQUFBLFlBR0EsV0FBQSxHQUFjLEVBSGQsQ0FBQTtBQUlBLGlCQUFBLHVDQUFBOzhCQUFBO0FBQ0UsY0FBQSxJQUFBLEdBQU8sTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFaLENBQWtCLENBQUMsSUFBbkIsQ0FBQSxDQUFQLENBQUE7QUFDQSxjQUFBLElBQUcsUUFBQSxLQUFZLElBQWY7QUFDRSxnQkFBQSxXQUFXLENBQUMsSUFBWixDQUFpQixFQUFqQixDQUFBLENBQUE7QUFBQSxnQkFDQSxRQUFBLEdBQVcsSUFEWCxDQURGO2VBREE7QUFBQSxjQUlBLFdBQVksQ0FBQSxXQUFXLENBQUMsTUFBWixHQUFxQixDQUFyQixDQUF1QixDQUFDLElBQXBDLENBQXlDLElBQXpDLENBSkEsQ0FERjtBQUFBLGFBSkE7QUFXQSxtQkFBTyxXQUFQLENBWmE7VUFBQSxDQXBJZixDQUFBO0FBQUEsVUFrSkEsS0FBSyxDQUFDLFdBQU4sQ0FBa0IsQ0FBQyxTQUFELEVBQVksU0FBWixFQUF1QixPQUF2QixDQUFsQixFQUFtRCxTQUFBLEdBQUE7QUFDakQsZ0JBQUEsaUVBQUE7QUFBQSxZQUFBLElBQWMsbUJBQWQ7QUFBQSxvQkFBQSxDQUFBO2FBQUE7QUFDQTtBQUFBO2lCQUFBLHFDQUFBOzRCQUFBO0FBQ0UsY0FBQSxRQUFBLEdBQVcsTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFaLENBQVgsQ0FBQTtBQUFBLGNBQ0EsWUFBQSxHQUFrQixxQkFBSCxHQUF1QixRQUFRLENBQUMsT0FBVCxDQUFpQixLQUFLLENBQUMsT0FBdkIsRUFBZ0MsS0FBSyxDQUFDLElBQXRDLENBQXZCLEdBQXdFLElBRHZGLENBQUE7QUFBQSxjQUVBLGFBQUEsR0FBbUIscUJBQUgsR0FBdUIsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsS0FBSyxDQUFDLE9BQXhCLEVBQWlDLEtBQUssQ0FBQyxJQUF2QyxDQUF2QixHQUF5RSxJQUZ6RixDQUFBO0FBQUEsMkJBR0EsSUFBSSxDQUFDLFVBQUwsR0FBa0IsWUFBQSxJQUFpQixjQUhuQyxDQURGO0FBQUE7MkJBRmlEO1VBQUEsQ0FBbkQsQ0FsSkEsQ0FBQTtBQUFBLFVBMkpBLEtBQUssQ0FBQyxNQUFOLENBQWEsMkNBQWIsRUFBMEQsU0FBQSxHQUFBO0FBQ3hELGdCQUFBLHVEQUFBO0FBQUEsWUFBQSxJQUFjLG1CQUFkO0FBQUEsb0JBQUEsQ0FBQTthQUFBO0FBQ0E7QUFBQTtpQkFBQSxxQ0FBQTs0QkFBQTtBQUNFLGNBQUEsUUFBQSxHQUFXLE1BQUEsQ0FBTyxJQUFJLENBQUMsS0FBWixDQUFYLENBQUE7QUFDQSxjQUFBLElBQU8sNEJBQUosSUFBZ0MsMkJBQW5DOzZCQUNFLElBQUksQ0FBQyxNQUFMLEdBQWMsT0FEaEI7ZUFBQSxNQUFBO0FBR0UsZ0JBQUEsSUFBRywwQkFBSDtBQUNFLGtCQUFBLFFBQUEsR0FBVyxRQUFRLENBQUMsUUFBVCxDQUFrQixLQUFLLENBQUMsWUFBeEIsRUFBc0MsS0FBSyxDQUFDLElBQTVDLENBQUEsSUFBcUQsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsS0FBSyxDQUFDLFlBQXRCLEVBQzVELEtBQUssQ0FBQyxJQURzRCxDQUFoRSxDQURGO2lCQUFBLE1BQUE7QUFJRSxrQkFBQSxRQUFBLEdBQVcsSUFBWCxDQUpGO2lCQUFBO0FBS0EsZ0JBQUEsSUFBRyx5QkFBSDtBQUNFLGtCQUFBLE9BQUEsR0FBVSxRQUFRLENBQUMsT0FBVCxDQUFpQixLQUFLLENBQUMsV0FBdkIsRUFBb0MsS0FBSyxDQUFDLElBQTFDLENBQUEsSUFBbUQsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsS0FBSyxDQUFDLFdBQXRCLEVBQW1DLEtBQUssQ0FBQyxJQUF6QyxDQUE3RCxDQURGO2lCQUFBLE1BQUE7QUFHRSxrQkFBQSxPQUFBLEdBQVUsSUFBVixDQUhGO2lCQUxBO0FBQUEsNkJBVUEsSUFBSSxDQUFDLE1BQUwsR0FBYyxRQUFBLElBQWEsUUFWM0IsQ0FIRjtlQUZGO0FBQUE7MkJBRndEO1VBQUEsQ0FBMUQsQ0EzSkEsQ0FBQTtBQUFBLFVBK0tBLEtBQUssQ0FBQyxNQUFOLENBQWEseUJBQWIsRUFBd0MsU0FBQSxHQUFBO0FBQ3RDLGdCQUFBLGlCQUFBO0FBQUEsWUFBQSxJQUFjLG1CQUFkO0FBQUEsb0JBQUEsQ0FBQTthQUFBO0FBRUE7QUFBQSxpQkFBQSxxQ0FBQTs0QkFBQTtBQUNFLGNBQUEsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFaLENBQWtCLENBQUMsTUFBbkIsQ0FBMEIsS0FBSyxDQUFDLFFBQWhDLEVBQTBDLEtBQUssQ0FBQyxJQUFoRCxDQUFoQixDQURGO0FBQUEsYUFGQTtBQUFBLFlBS0EsS0FBSyxDQUFDLFFBQU4sR0FBaUIsV0FBQSxDQUFBLENBTGpCLENBQUE7bUJBTUEsS0FBSyxDQUFDLFlBQU4sR0FBcUIsZUFBQSxDQUFBLEVBUGlCO1VBQUEsQ0FBeEMsQ0EvS0EsQ0FBQTtBQUFBLFVBeUxBLEtBQUssQ0FBQyxNQUFOLENBQWEsaUJBQWIsRUFBZ0MsU0FBQSxHQUFBO0FBRTlCLGdCQUFBLDhDQUFBO0FBQUEsWUFBQSxJQUFBLEdBQU8sS0FBTSxDQUFBLEtBQUssQ0FBQyxJQUFOLENBQWIsQ0FBQTtBQUFBLFlBQ0EsUUFBQSxHQUFXLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBQSxDQUFPLEtBQUssQ0FBQyxRQUFiLENBQVgsQ0FEWCxDQUFBO0FBQUEsWUFFQSxNQUFBLEdBQVMsSUFBSSxDQUFDLElBRmQsQ0FBQTtBQUFBLFlBR0EsTUFBQSxHQUFTLElBQUksQ0FBQyxNQUhkLENBQUE7QUFBQSxZQUtBLEtBQUssQ0FBQyxLQUFOOztBQUFjO21CQUFTLGlEQUFULEdBQUE7QUFDWixnQkFBQSxXQUFBLEdBQWM7QUFBQSxrQkFDWixJQUFBLEVBQU0sSUFBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLEVBQXVCLEtBQUssQ0FBQyxRQUE3QixDQUFBLEdBQXlDLENBRG5DO0FBQUEsa0JBRVosTUFBQSxFQUFRLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixFQUF1QixLQUFLLENBQUMsUUFBN0IsQ0FBQSxHQUF5QyxDQUZyQztBQUFBLGtCQUdaLFNBQUEsRUFBVyxNQUFBLENBQU8sUUFBUCxDQUFnQixDQUFDLE1BQWpCLENBQXdCLElBQUksQ0FBQyxNQUE3QixDQUhDO0FBQUEsa0JBSVosS0FBQSxFQUFPLE1BQUEsQ0FBTyxRQUFQLENBQWdCLENBQUMsTUFBakIsQ0FBQSxDQUpLO2lCQUFkLENBQUE7QUFBQSxnQkFNQSxRQUFRLENBQUMsR0FBVCxDQUFhLE1BQWIsQ0FOQSxDQUFBO0FBQUEsNkJBT0EsWUFQQSxDQURZO0FBQUE7O2dCQUxkLENBQUE7QUFlQSxZQUFBLElBQTZDLEtBQUssQ0FBQyxJQUFOLEtBQWMsS0FBM0Q7QUFBQSxjQUFBLEtBQUssQ0FBQyxPQUFOLEdBQWdCLFlBQUEsQ0FBYSxLQUFLLENBQUMsS0FBbkIsQ0FBaEIsQ0FBQTthQWpCOEI7VUFBQSxDQUFoQyxDQXpMQSxDQUFBO0FBQUEsVUFrTkEsYUFBQSxHQUFnQixTQUFDLElBQUQsR0FBQTtBQUNkLGdCQUFBLEtBQUE7QUFBQSxZQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsT0FBTixDQUFjLElBQWQsQ0FBUixDQUFBO0FBQ0EsWUFBQSxJQUFHLEtBQUEsS0FBUyxDQUFBLENBQVo7QUFDRSxvQkFBVSxJQUFBLEtBQUEsQ0FBTSxhQUFBLEdBQWdCLElBQWhCLEdBQXVCLGVBQTdCLENBQVYsQ0FERjthQUFBLE1BQUE7QUFHRSxjQUFBLElBQUcsS0FBQSxFQUFBLEdBQVUsS0FBSyxDQUFDLE1BQW5CO3VCQUNFLEtBQU0sQ0FBQSxLQUFBLEVBRFI7ZUFBQSxNQUFBO3VCQUdFLEtBQU0sV0FIUjtlQUhGO2FBRmM7VUFBQSxDQWxOaEIsQ0FBQTtBQUFBLFVBNE5BLEtBQUssQ0FBQyxRQUFOLEdBQWlCLFNBQUMsS0FBRCxHQUFBO0FBQ2YsWUFBQSxJQUFHLGFBQUg7QUFDRSxjQUFBLEtBQUssQ0FBQyxlQUFOLENBQUEsQ0FBQSxDQUFBO0FBQUEsY0FDQSxLQUFLLENBQUMsY0FBTixDQUFBLENBREEsQ0FERjthQUFBO21CQUlBLEtBQUssQ0FBQyxVQUFOLENBQ0UsYUFBQSxDQUNFLEtBQUssQ0FBQyxJQURSLENBREYsRUFMZTtVQUFBLENBNU5qQixDQUFBO0FBQUEsVUEwT0EsaUJBQUEsR0FBb0IsU0FBQyxJQUFELEdBQUE7QUFDbEIsZ0JBQUEsS0FBQTtBQUFBLFlBQUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxDQUFSLENBQUE7QUFDQSxZQUFBLElBQUcsS0FBQSxLQUFTLENBQUEsQ0FBWjtBQUNFLG9CQUFVLElBQUEsS0FBQSxDQUFNLGFBQUEsR0FBZ0IsSUFBaEIsR0FBdUIsZUFBN0IsQ0FBVixDQURGO2FBQUEsTUFBQTtBQUdFLGNBQUEsSUFBRyxLQUFBLEVBQUEsR0FBVSxDQUFiO3VCQUNFLEtBQU0sQ0FBQSxLQUFBLEVBRFI7ZUFBQSxNQUFBO3VCQUdFLEtBQU0sQ0FBQSxDQUFBLEVBSFI7ZUFIRjthQUZrQjtVQUFBLENBMU9wQixDQUFBO0FBQUEsVUFxUEEsS0FBSyxDQUFDLFlBQU4sR0FBcUIsU0FBQyxLQUFELEdBQUE7QUFDbkIsWUFBQSxJQUFHLGFBQUg7QUFDRSxjQUFBLEtBQUssQ0FBQyxlQUFOLENBQUEsQ0FBQSxDQUFBO0FBQUEsY0FDQSxLQUFLLENBQUMsY0FBTixDQUFBLENBREEsQ0FERjthQUFBO21CQUlBLEtBQUssQ0FBQyxVQUFOLENBQ0UsaUJBQUEsQ0FDRSxLQUFLLENBQUMsSUFEUixDQURGLEVBTG1CO1VBQUEsQ0FyUHJCLENBQUE7aUJBZ1FBLEtBQUssQ0FBQyxVQUFOLEdBQW1CLFNBQUMsSUFBRCxFQUFPLEtBQVAsR0FBQTtBQUNqQixZQUFBLElBQUcsYUFBSDtBQUNFLGNBQUEsS0FBSyxDQUFDLGVBQU4sQ0FBQSxDQUFBLENBQUE7QUFBQSxjQUNBLEtBQUssQ0FBQyxjQUFOLENBQUEsQ0FEQSxDQURGO2FBQUE7bUJBSUEsS0FBSyxDQUFDLElBQU4sR0FBYSxLQUxJO1VBQUEsRUFqUWY7UUFBQSxDQWJDO0FBQUEsUUFxUlAsUUFBQSxFQUFVLEdBclJIO0FBQUEsUUFzUlAsUUFBQSxFQUFVLG0rREF0Ukg7T0FBUCxDQURnRTtJQUFBLENBQXpCO0dBQXpDLENBeEVBLENBQUE7O0FBNFlBO0FBQUE7O0tBNVlBOztBQUFBLEVBK1lBLE1BQU0sQ0FBQyxTQUFQLENBQWlCLHNCQUFqQixFQUF5QztJQUFDLHNCQUFELEVBQXlCLFNBQUMsYUFBRCxHQUFBO0FBQ2hFLGFBQU87QUFBQSxRQUNQLEtBQUEsRUFBTztBQUFBLFVBQ0wsT0FBQSxFQUFTLElBREo7QUFBQSxVQUVMLE9BQUEsRUFBUyxJQUZKO0FBQUEsVUFHTCxJQUFBLEVBQU0sSUFIRDtBQUFBLFVBSUwsTUFBQSxFQUFRLEdBSkg7QUFBQSxVQUtMLFFBQUEsRUFBVSxJQUxMO0FBQUEsVUFNTCxJQUFBLEVBQU0sR0FORDtBQUFBLFVBT0wsRUFBQSxFQUFJLEdBUEM7U0FEQTtBQUFBLFFBVVAsT0FBQSxFQUFTLElBVkY7QUFBQSxRQVdQLElBQUEsRUFBTSxTQUFDLEtBQUQsRUFBUSxHQUFSLEVBQWEsSUFBYixHQUFBO0FBSUosY0FBQSxrQ0FBQTtBQUFBLFVBQUEsS0FBSyxDQUFDLE1BQU4sR0FBc0Isc0JBQVAsR0FBNEI7QUFBQSxZQUMzQyxHQUFBLEVBQUs7Y0FBQztBQUFBLGdCQUFDLE1BQUEsRUFBUSxNQUFUO0FBQUEsZ0JBQWlCLElBQUEsRUFBTSxPQUF2QjtlQUFELEVBQWtDO0FBQUEsZ0JBQUMsTUFBQSxFQUFRLEdBQVQ7ZUFBbEMsRUFBZ0Q7QUFBQSxnQkFBQyxNQUFBLEVBQVEsTUFBVDtBQUFBLGdCQUFpQixJQUFBLEVBQU0sTUFBdkI7ZUFBaEQ7YUFEc0M7QUFBQSxZQUUzQyxLQUFBLEVBQU87Y0FBQztBQUFBLGdCQUFDLE1BQUEsRUFBUSxNQUFUO0FBQUEsZ0JBQWlCLElBQUEsRUFBTSxPQUF2QjtlQUFELEVBQWtDO0FBQUEsZ0JBQUMsTUFBQSxFQUFRLEdBQVQ7ZUFBbEMsRUFBZ0Q7QUFBQSxnQkFBQyxNQUFBLEVBQVEsTUFBVDtBQUFBLGdCQUFpQixJQUFBLEVBQU0sTUFBdkI7ZUFBaEQ7YUFGb0M7V0FBNUIsR0FHUixLQUFLLENBQUMsTUFBTixDQUFBLENBSFAsQ0FBQTtBQUFBLFVBT0EsS0FBSyxDQUFDLElBQU4sR0FBYSxLQUFLLENBQUMsTUFBTixHQUFlLEtBQUssQ0FBQyxLQUFOLEdBQWMsSUFQMUMsQ0FBQTtBQVFBLFVBQUEsSUFBMkUsc0JBQTNFO0FBQUEsWUFBQSxLQUFLLENBQUMsT0FBTixHQUFnQixLQUFLLENBQUMsU0FBTixHQUFrQixLQUFLLENBQUMsT0FBTixHQUFnQixNQUFBLENBQUEsQ0FBUSxDQUFDLE1BQVQsQ0FBQSxDQUFsRCxDQUFBO1dBUkE7QUFBQSxVQVNBLEtBQUssQ0FBQyxPQUFOLEdBQWdCLElBVGhCLENBQUE7QUFBQSxVQVVBLEtBQUssQ0FBQyxJQUFOLEdBQWEsS0FWYixDQUFBO0FBQUEsVUFXQSxLQUFLLENBQUMsR0FBTixHQUFZLEtBQUssQ0FBQyxHQUFOLEdBQVksS0FBSyxDQUFDLEdBQU4sR0FBWSxLQUFLLENBQUMsR0FBTixHQUFZLEtBQUssQ0FBQyxHQUFOLEdBQVksS0FBSyxDQUFDLEdBQU4sR0FBWSxJQVh4RSxDQUFBO0FBQUEsVUFhQSxLQUFLLENBQUMsTUFBTixDQUFhLHNCQUFiLEVBQXFDLFNBQUEsR0FBQTtBQUNuQyxnQkFBQSxhQUFBO0FBQUEsWUFBQSxJQUFBLENBQUEsQ0FBYyxvQkFBQSxJQUFnQixrQkFBOUIsQ0FBQTtBQUFBLG9CQUFBLENBQUE7YUFBQTtBQUFBLFlBRUEsSUFBQSxHQUFPLE1BQUEsQ0FBTyxLQUFLLENBQUMsSUFBYixDQUZQLENBQUE7QUFBQSxZQUdBLEVBQUEsR0FBSyxNQUFBLENBQU8sS0FBSyxDQUFDLEVBQWIsQ0FITCxDQUFBO0FBTUEsWUFBQSxJQUEyQixFQUFBLEdBQUssSUFBaEM7QUFBQSxjQUFBLE1BQWEsQ0FBQyxFQUFELEVBQUssSUFBTCxDQUFiLEVBQUMsYUFBRCxFQUFPLFdBQVAsQ0FBQTthQU5BO0FBQUEsWUFRQSxLQUFLLENBQUMsR0FBTixHQUFZLEtBQUssQ0FBQyxHQUFOLEdBQVksS0FBSyxDQUFDLEdBQU4sR0FBWSxFQUFFLENBQUMsTUFBSCxDQUFBLENBUnBDLENBQUE7bUJBU0EsS0FBSyxDQUFDLEdBQU4sR0FBWSxLQUFLLENBQUMsR0FBTixHQUFZLEtBQUssQ0FBQyxHQUFOLEdBQVksSUFBSSxDQUFDLE1BQUwsQ0FBQSxFQVZEO1VBQUEsQ0FBckMsQ0FiQSxDQUFBO0FBQUEsVUEyQkEsVUFBQSxHQUNFO0FBQUEsWUFBQSxNQUFBLEVBQ0U7QUFBQSxjQUFBLFFBQUEsRUFBVSxNQUFNLENBQUMsUUFBUCxDQUFnQixFQUFoQixFQUFvQixNQUFwQixDQUFWO0FBQUEsY0FDQSxJQUFBLEVBQU0sTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsTUFBbkIsQ0FETjthQURGO0FBQUEsWUFHQSxJQUFBLEVBQ0U7QUFBQSxjQUFBLFFBQUEsRUFBVSxNQUFNLENBQUMsUUFBUCxDQUFnQixFQUFoQixFQUFvQixNQUFwQixDQUFWO0FBQUEsY0FDQSxJQUFBLEVBQU0sTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsTUFBbkIsQ0FETjthQUpGO0FBQUEsWUFTQSxHQUFBLEVBQ0U7QUFBQSxjQUFBLFFBQUEsRUFBVSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFoQixFQUFtQixPQUFuQixDQUFWO0FBQUEsY0FDQSxJQUFBLEVBQU0sTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsT0FBbkIsQ0FETjthQVZGO0FBQUEsWUFZQSxLQUFBLEVBQ0U7QUFBQSxjQUFBLFFBQUEsRUFBVSxNQUFNLENBQUMsUUFBUCxDQUFnQixFQUFoQixFQUFvQixPQUFwQixDQUFWO0FBQUEsY0FDQSxJQUFBLEVBQU0sTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsT0FBbkIsQ0FETjthQWJGO0FBQUEsWUFlQSxJQUFBLEVBQ0U7QUFBQSxjQUFBLFFBQUEsRUFBVSxNQUFNLENBQUMsUUFBUCxDQUFnQixHQUFoQixFQUFxQixNQUFyQixDQUFWO0FBQUEsY0FDQSxJQUFBLEVBQU0sTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsT0FBbkIsQ0FETjthQWhCRjtXQTVCRixDQUFBO0FBQUEsVUErQ0EsS0FBSyxDQUFDLE1BQU4sQ0FBYSxpQkFBYixFQUFnQyxTQUFBLEdBQUE7QUFDOUIsWUFBQSxLQUFLLENBQUMsT0FBTixHQUFnQixNQUFBLENBQU8sTUFBQSxDQUFPLEtBQUssQ0FBQyxRQUFiLENBQUEsR0FBeUIsQ0FBQyxDQUFBLEdBQUksVUFBVyxDQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBQyxJQUE1QixDQUFoQyxDQUFrRSxDQUFDLE1BQW5FLENBQUEsQ0FBaEIsQ0FBQTtBQUFBLFlBQ0EsS0FBSyxDQUFDLFNBQU4sR0FBa0IsTUFBQSxDQUFPLE1BQUEsQ0FBTyxLQUFLLENBQUMsUUFBYixDQUFBLEdBQXlCLENBQUMsQ0FBQSxHQUFJLFVBQVcsQ0FBQSxLQUFLLENBQUMsSUFBTixDQUFXLENBQUMsSUFBNUIsQ0FBaEMsQ0FBa0UsQ0FBQyxNQUFuRSxDQUFBLENBRGxCLENBQUE7bUJBRUEsS0FBSyxDQUFDLFFBQU4sR0FBaUIsTUFBQSxDQUFPLE1BQUEsQ0FBTyxLQUFLLENBQUMsUUFBYixDQUFBLEdBQXlCLENBQUMsQ0FBQSxHQUFJLFVBQVcsQ0FBQSxLQUFLLENBQUMsSUFBTixDQUFXLENBQUMsSUFBNUIsQ0FBaEMsQ0FBa0UsQ0FBQyxNQUFuRSxDQUFBLEVBSGE7VUFBQSxDQUFoQyxDQS9DQSxDQUFBO0FBQUEsVUFxREEsS0FBSyxDQUFDLEtBQU4sR0FBYyxTQUFBLEdBQUE7bUJBQ1osS0FBSyxDQUFDLFFBQU4sR0FBaUIsTUFBQSxDQUFPLE1BQUEsQ0FBTyxLQUFLLENBQUMsUUFBYixDQUFBLEdBQXlCLFVBQVcsQ0FBQSxLQUFLLENBQUMsSUFBTixDQUFXLENBQUMsSUFBdkQsQ0FBNEQsQ0FBQyxNQUE3RCxDQUFBLEVBREw7VUFBQSxDQXJEZCxDQUFBO0FBQUEsVUF3REEsS0FBSyxDQUFDLFNBQU4sR0FBa0IsU0FBQSxHQUFBO21CQUNoQixLQUFLLENBQUMsUUFBTixHQUFpQixNQUFBLENBQU8sTUFBQSxDQUFPLEtBQUssQ0FBQyxRQUFiLENBQUEsR0FBeUIsVUFBVyxDQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBQyxJQUF2RCxDQUE0RCxDQUFDLE1BQTdELENBQUEsRUFERDtVQUFBLENBeERsQixDQUFBO0FBQUEsVUEyREEsU0FBQSxHQUFZLElBM0RaLENBQUE7QUFBQSxVQTREQSxXQUFBLEdBQWMsU0FBQyxPQUFELEdBQUE7QUFDWixZQUFBLElBQU8saUJBQVA7QUFDRSxjQUFBLEtBQUssQ0FBQyxJQUFOLEdBQWEsT0FBYixDQUFBO0FBQUEsY0FDQSxLQUFLLENBQUMsRUFBTixHQUFXLElBRFgsQ0FBQTtxQkFFQSxTQUFBLEdBQVksS0FBSyxDQUFDLE1BQU4sQ0FBYSxPQUFiLEVBQXNCLFNBQUMsT0FBRCxHQUFBO3VCQUNoQyxLQUFLLENBQUMsRUFBTixHQUFXLE1BQUEsQ0FBTyxPQUFQLENBQWUsQ0FBQyxNQUFoQixDQUFBLEVBRHFCO2NBQUEsQ0FBdEIsRUFIZDthQUFBLE1BQUE7QUFPRSxjQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7cUJBQ0EsU0FBQSxHQUFZLEtBUmQ7YUFEWTtVQUFBLENBNURkLENBQUE7QUFBQSxVQXVFQSxLQUFLLENBQUMsTUFBTixDQUFhLE1BQWIsRUFBcUIsV0FBckIsQ0F2RUEsQ0FBQTtBQUFBLFVBd0VBLEtBQUssQ0FBQyxNQUFOLENBQWEsUUFBYixFQUF1QixXQUF2QixDQXhFQSxDQUFBO2lCQXlFQSxLQUFLLENBQUMsTUFBTixDQUFhLE9BQWIsRUFBc0IsV0FBdEIsRUE3RUk7UUFBQSxDQVhDO0FBQUEsUUEyRlAsUUFBQSxFQUFVLEdBM0ZIO0FBQUEsUUE0RlAsUUFBQSxFQUFVLHVrREE1Rkg7T0FBUCxDQURnRTtJQUFBLENBQXpCO0dBQXpDLENBL1lBLENBQUE7QUFBQSIsImZpbGUiOiJhbmd1bGFyLW1vbWVudC10aW1lcGlja2VyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gICAgYW5ndWxhci1tb21lbnQtZGF0ZXRpbWVwaWNrZXJcblxuICAgIEEgaGlnaGx5IGV4dGVuc2libGUgZGF0ZSB0aW1lIHBpY2tlciBkaXJlY3RpdmUuXG4jIyNcbm1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlICd1aS5ib290c3RyYXAubW9tZW50LmRhdGV0aW1lcGlja2VyJywgW11cbiNcbiMgQ29udGFpbiBkZWZhdWx0IHBhcmFtZXRlcnMgZm9yIHRoZSBkaXJlY3RpdmVcbiNcbm1vZHVsZS5jb25zdGFudCAnZGF0ZVRpbWVQaWNrZXJDb25maWcnLCB7XG4gIHllYXI6XG4gICAgZm9ybWF0OiAnWVlZWSdcbiAgICBmaXJzdDogKGRhdGUpIC0+XG4gICAgICBkYXRlLnllYXIocGFyc2VJbnQoZGF0ZS55ZWFyKCkgLyAxMCwgMTApICogMTApXG4gICAgYW1vdW50OiAxMlxuICAgIGxpbmU6IG1vbWVudC5kdXJhdGlvbig0LCAneWVhcicpXG4gICAgc3RlcDogbW9tZW50LmR1cmF0aW9uKDEsICd5ZWFyJylcbiAgICBwcmV2aW91czogbW9tZW50LmR1cmF0aW9uKC0xMCwgJ3llYXInKVxuICAgIG5leHQ6IG1vbWVudC5kdXJhdGlvbigxMCwgJ3llYXInKVxuICBtb250aDpcbiAgICBmb3JtYXQ6ICdNTU0gWVknXG4gICAgZmlyc3Q6IChkYXRlKSAtPlxuICAgICAgZGF0ZS5tb250aCgwKVxuICAgIGFtb3VudDogMTJcbiAgICBsaW5lOiBtb21lbnQuZHVyYXRpb24oNCwgJ21vbnRoJylcbiAgICBzdGVwOiBtb21lbnQuZHVyYXRpb24oMSwgJ21vbnRoJylcbiAgICBwcmV2aW91czogbW9tZW50LmR1cmF0aW9uKC0xLCAneWVhcicpXG4gICAgbmV4dDogbW9tZW50LmR1cmF0aW9uKDEsICd5ZWFyJylcbiAgZGF5OlxuICAgIGZvcm1hdDogJ0QnXG4gICAgZmlyc3Q6IChkYXRlKSAtPlxuICAgICAgZGF0ZS5kYXRlKDEpXG4gICAgICBkYXRlLnN1YnRyYWN0KE1hdGguYWJzKGRhdGUud2Vla2RheSgpKSwgJ2RheXMnKVxuICAgIGNvbXBhcmU6IChhLCBiKSAtPlxuICAgICAgKG1vbWVudChhKS5tb250aCgpICsgMSkgLSAobW9tZW50KGIpLm1vbnRoKCkgKyAxKVxuICAgIGFtb3VudDogNDJcbiAgICBsaW5lOiBtb21lbnQuZHVyYXRpb24oNywgJ2RheScpXG4gICAgc3RlcDogbW9tZW50LmR1cmF0aW9uKDEsICdkYXknKVxuICAgIHByZXZpb3VzOiBtb21lbnQuZHVyYXRpb24oLTEsICdtb250aCcpXG4gICAgbmV4dDogbW9tZW50LmR1cmF0aW9uKDEsICdtb250aCcpXG4gIGhvdXI6XG4gICAgZm9ybWF0OiAnaGg6bW0nXG4gICAgZmlyc3Q6IChkYXRlKSAtPlxuICAgICAgZGF0ZS5ob3VycygwKS5taW51dGVzKDApXG4gICAgYW1vdW50OiAyNFxuICAgIGxpbmU6IG1vbWVudC5kdXJhdGlvbig0LCAnaG91cicpXG4gICAgc3RlcDogbW9tZW50LmR1cmF0aW9uKDEsICdob3VyJylcbiAgICBwcmV2aW91czogbW9tZW50LmR1cmF0aW9uKC0xLCAnZGF5JylcbiAgICBuZXh0OiBtb21lbnQuZHVyYXRpb24oMSwgJ2RheScpXG4gIG1pbnV0ZTpcbiAgICBmb3JtYXQ6ICdoaDptbSdcbiAgICBmaXJzdDogKGRhdGUpIC0+XG4gICAgICBkYXRlLmhvdXJzKDApLm1pbnV0ZXMoMClcbiAgICBhbW91bnQ6IDI0XG4gICAgbGluZTogbW9tZW50LmR1cmF0aW9uKDIsICdob3VyJylcbiAgICBzdGVwOiBtb21lbnQuZHVyYXRpb24oMTUsICdtaW51dGUnKVxuICAgIHByZXZpb3VzOiBtb21lbnQuZHVyYXRpb24oLTEsICdob3VyJylcbiAgICBuZXh0OiBtb21lbnQuZHVyYXRpb24oMSwgJ2hvdXInKVxuICBzZWNvbmQ6XG4gICAgZm9ybWF0OiAnaGg6bW06c3MnXG4gICAgZmlyc3Q6IChkYXRlKSAtPlxuICAgICAgZGF0ZS5ob3VycygwKS5taW51dGVzKDApLnNlY29uZHMocGFyc2VJbnQoZGF0ZS5zZWNvbmRzKCkgLyAxNSwgMTApICogMTUpXG4gICAgYW1vdW50OiA0ICogM1xuICAgIGxpbmU6IG1vbWVudC5kdXJhdGlvbigyMCwgJ3NlY29uZCcpXG4gICAgc3RlcDogbW9tZW50LmR1cmF0aW9uKDUsICdzZWNvbmQnKVxuICAgIHByZXZpb3VzOiBtb21lbnQuZHVyYXRpb24oLTEsICdob3VyJylcbiAgICBuZXh0OiBtb21lbnQuZHVyYXRpb24oMSwgJ2hvdXInKVxufVxuXG4jXG4jIG1vbWVudCBkYXRldGltZXBpY2tlciBkaXJlY3RpdmUuXG4jXG5tb2R1bGUuZGlyZWN0aXZlICdtb21lbnREYXRldGltZXBpY2tlcicsIFsnZGF0ZVRpbWVQaWNrZXJDb25maWcnLCAoZGVmYXVsdENvbmZpZyktPlxuICByZXR1cm4ge1xuICBzY29wZToge1xuICAgIG1pbkRhdGU6ICc9PycgICAgICMgbWluaW11bSBzZWxlY3Rpb25hYmxlIGRhdGUuXG4gICAgbWF4RGF0ZTogJz0/JyAgICAgIyBtYXhpbXVtIHNlbGVjdGlvbmFibGUgZGF0ZS5cbiAgICB2aWV3OiAnPT8nXG4gICAgdG9rZW5zOiAnJidcbiAgICBwb3NpdGlvbjogJz0/JyAgICAjIERlZmF1bHQgdG8gbmctbW9kZWwuXG4gICAgc2VsZWN0ZWQ6ICc9PycgICAgIyBIb2xkIHRoZSBzZWxlY3Rpb24gdW50aWwgY29tbWl0LlxuICAgIGhvdmVyZWQ6ICc9PydcbiAgICBhY3RpdmVCZWZvcmU6ICc9PydcbiAgICBhY3RpdmVBZnRlcjogJz0/J1xuICB9XG4gIHJlcGxhY2U6IHRydWVcbiAgbGluazogKHNjb3BlLCBlbG0sIGF0dHIpLT5cbiAgICBzY29wZS52aWV3ID0gJ3llYXInIGlmIG5vdCBzY29wZS52aWV3P1xuXG4gICAgI1xuICAgICMgVXNlZCB0byBjYWxjdWxhdGUgdGhlIG5leHQgdmFsdWVzXG4gICAgI1xuICAgIHN0ZXBzID0gZGVmYXVsdENvbmZpZ1xuXG4gICAgIyBUaGlzIHNob3VsZCBiZSBjYWxjdWxhdGVkIEQuIE0gWVlZWVxuICAgIHNjb3BlLnRva2VucyA9IGlmIG5vdCBzY29wZS50b2tlbnMoKT8gdGhlbiBbXG4gICAgICB7Zm9ybWF0OiAnZCcsIHZpZXc6ICdkYXknfVxuICAgICAge2Zvcm1hdDogJy4gJ31cbiAgICAgIHtmb3JtYXQ6ICdNTU1NJywgdmlldzogJ21vbnRoJ31cbiAgICAgIHtmb3JtYXQ6ICcgJ31cbiAgICAgIHtmb3JtYXQ6ICd5eXl5JywgdmlldzogJ3llYXInfVxuICAgIF0gZWxzZSBzY29wZS50b2tlbnMoKVxuXG4gICAgI1xuICAgICMgSGVscGVyIGZ1bmN0aW9ucyByZXR1cm5pbmcgdGhlIGR1cmF0aW9uc1xuICAgICMgcmVxdWlyZWQgdG8gbW92ZSB3aXRoIHRoZSBrZXlib2FyZC5cbiAgICAjXG4gICAgZ29MZWZ0ID0gLT5cbiAgICAgIC1zdGVwc1tzY29wZS52aWV3XS5zdGVwXG4gICAgZ29SaWdodCA9IC0+XG4gICAgICBzdGVwc1tzY29wZS52aWV3XS5zdGVwXG4gICAgZ29Eb3duID0gLT5cbiAgICAgIHN0ZXBzW3Njb3BlLnZpZXddLmxpbmVcbiAgICBnb1VwID0gLT5cbiAgICAgIC1zdGVwc1tzY29wZS52aWV3XS5saW5lXG5cbiAgICBzY29wZS5rZXlQcmVzcyA9ICgkZXZlbnQpIC0+XG4gICAgICBzZWxlY3RlZCA9IG1vbWVudChzY29wZS5zZWxlY3RlZClcblxuICAgICAgc3dpdGNoICRldmVudC5rZXlDb2RlXG4gICAgICAgIHdoZW4gMzkgdGhlbiBzY29wZS5zZWxlY3Qoc2VsZWN0ZWQuYWRkKGdvUmlnaHQoKSksICRldmVudClcbiAgICAgICAgd2hlbiA0MCB0aGVuIHNjb3BlLnNlbGVjdChzZWxlY3RlZC5hZGQoZ29Eb3duKCkpLCAkZXZlbnQpXG4gICAgICAgIHdoZW4gMzcgdGhlbiBzY29wZS5zZWxlY3Qoc2VsZWN0ZWQuYWRkKGdvTGVmdCgpKSwgJGV2ZW50KVxuICAgICAgICB3aGVuIDM4IHRoZW4gc2NvcGUuc2VsZWN0KHNlbGVjdGVkLmFkZChnb1VwKCkpLCAkZXZlbnQpXG4gICAgICAgIHdoZW4gMTMgdGhlbiBzY29wZS5uZXh0VmlldygkZXZlbnQpICMgZW50ZXJcbiAgICAgICAgd2hlbiA4IHRoZW4gc2NvcGUucHJldmlvdXNWaWV3KCRldmVudCkgIyBiYWNrc3BhY2VcbiAgICAgICAgd2hlbiA5IHRoZW4gYW5ndWxhci5ub29wICN0YWJcbiAgICAgICAgd2hlbiAyNyB0aGVuIGFuZ3VsYXIubm9vcCAjIGVzY1xuXG5cbiAgICAjIFNob3VsZCBvYnNlcnZlIG9uXG4gICAgIyBkYXRlIHZhbHVlLlxuICAgICMgbWluXG4gICAgIyBtYXhcbiAgICAjIGZvcm1hdFxuICAgICMgY29uZmlnXG4gICAgIyBsb2NhbGVcblxuICAgIHZpZXdzID0gW1xuICAgICAgJ3llYXInLCAnbW9udGgnLCAnZGF5JyxcbiAgICAgICdob3VyJywgJ21pbnV0ZScsICdzZWNvbmQnXG4gICAgXVxuXG4gICAgc2NvcGUuZG93ID0gbW9tZW50LndlZWtkYXlzU2hvcnQoKVxuXG4gICAgc2NvcGUuaG92ZXIgPSAoZGF0ZSwgZXZlbnQpIC0+XG4gICAgICBpZiBldmVudD9cbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBzY29wZS5ob3ZlcmVkID0gaWYgZGF0ZS52YWx1ZT8gdGhlbiBtb21lbnQoZGF0ZS52YWx1ZSkudG9EYXRlKCkgZWxzZSBtb21lbnQoZGF0ZSkudG9EYXRlKClcblxuICAgICNcbiAgICAjIFNldCBzZWxlY3RlZCB0byB0aGUgdmFsdWUgb2YgdGhlIGRhdGUgYXJndW1lbnQuXG4gICAgI1xuICAgIHNjb3BlLnNlbGVjdCA9IChkYXRlLCBldmVudCkgLT5cbiAgICAgIGlmIGV2ZW50P1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIHNjb3BlLnNlbGVjdGVkID0gaWYgZGF0ZS52YWx1ZT8gdGhlbiBtb21lbnQoZGF0ZS52YWx1ZSkudG9EYXRlKCkgZWxzZSBtb21lbnQoZGF0ZSkudG9EYXRlKClcblxuXG4gICAgI1xuICAgICMgQ2hhbmdlIHRvIHRoZSBuZXh0IHBvc2l0aW9uXG4gICAgI1xuICAgIHNjb3BlLm5leHQgPSAoZXZlbnQpIC0+XG4gICAgICBpZiBldmVudD9cbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBkYXRlID0gbW9tZW50KHNjb3BlLnNlbGVjdGVkKVxuICAgICAgb2Zmc2V0ID0gc3RlcHNbc2NvcGUudmlld10ubmV4dFxuICAgICAgZGF0ZS5hZGQob2Zmc2V0KVxuICAgICAgc2NvcGUucG9zaXRpb24gPSBkYXRlLnRvRGF0ZSgpXG5cbiAgICAjXG4gICAgIyBDaGFuZ2UgdG8gdGhlIHByZXZpb3VzIHBvc2l0aW9uXG4gICAgI1xuICAgIHNjb3BlLnByZXZpb3VzID0gKGV2ZW50KSAtPlxuICAgICAgaWYgZXZlbnQ/XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgICAgZGF0ZSA9IG1vbWVudChzY29wZS5zZWxlY3RlZClcbiAgICAgIG9mZnNldCA9IHN0ZXBzW3Njb3BlLnZpZXddLnByZXZpb3VzXG4gICAgICBkYXRlLmFkZChvZmZzZXQpXG4gICAgICBzY29wZS5wb3NpdGlvbiA9IGRhdGUudG9EYXRlKClcblxuXG4gICAgI1xuICAgICMgQ29tcHV0ZSBhIGJvb2xlYW4gdmFsdWUgdGhhdCBpbmRpY2F0ZSBpZlxuICAgICMgc3dpdGNoaW5nIHRvIHRoZSBuZXh0IHZpZXcgd291bGQgcHV0IHRoZVxuICAgICMgY3Vyc29yIG9uIGEgZGF0ZSBhZnRlciBtYXhEYXRlLlxuICAgICNcbiAgICAjIFJldHVybnMgdHJ1ZSBpZiBtYXhEYXRlIGlzIG5vdCBkZWZpbmVkLlxuICAgICNcbiAgICBjYW5OZXh0VmlldyA9IC0+XG4gICAgICBpZiBub3Qgc2NvcGUubWF4RGF0ZT9cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIG1vbWVudChzY29wZS5zZWxlY3RlZCkuYWRkKHN0ZXBzW3Njb3BlLnZpZXddLm5leHQpLmlzQmVmb3JlKHNjb3BlLm1heERhdGUpXG5cbiAgICAjXG4gICAgIyBDb21wdXRlIGEgYm9vbGVhbiB2YWx1ZSB0aGF0IGluZGljYXRlIGlmXG4gICAgIyBzd2l0Y2hpbmcgdG8gdGhlIHByZXZpb3VzIHZpZXcgd291bGQgcHV0IHRoZVxuICAgICMgY3Vyc29yIG9uIGEgZGF0ZSBiZWZvcmUgbWluRGF0ZS5cbiAgICAjXG4gICAgIyBSZXR1cm5zIHRydWUgaWYgbWluRGF0ZSBpcyBub3QgZGVmaW5lZC5cbiAgICAjXG4gICAgY2FuUHJldmlvdXNWaWV3ID0gLT5cbiAgICAgIGlmIG5vdCBzY29wZS5taW5EYXRlP1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gbW9tZW50KHNjb3BlLnNlbGVjdGVkKS5hZGQoc3RlcHNbc2NvcGUudmlld10ucHJldmlvdXMpLmlzQWZ0ZXIoc2NvcGUubWluRGF0ZSlcblxuICAgICNcbiAgICAjICBIZWxwZXIgbWV0aG9kIHRoYXQgc3BsaXQgdGhlIHN0ZXBzIGJ5IHdlZWtcbiAgICAjXG4gICAgc3BsaXRCeVdlZWtzID0gKHN0ZXBzID0gW10pIC0+XG4gICAgICByZXR1cm4gaWYgbm90IHNjb3BlLnN0ZXBzP1xuXG4gICAgICBsYXN0V2VlayA9IG51bGxcbiAgICAgIHN0ZXBzQnlXZWVrID0gW11cbiAgICAgIGZvciBzdGVwIGluIHN0ZXBzXG4gICAgICAgIHdlZWsgPSBtb21lbnQoc3RlcC52YWx1ZSkud2VlaygpXG4gICAgICAgIGlmIGxhc3RXZWVrICE9IHdlZWtcbiAgICAgICAgICBzdGVwc0J5V2Vlay5wdXNoIFtdXG4gICAgICAgICAgbGFzdFdlZWsgPSB3ZWVrXG4gICAgICAgIHN0ZXBzQnlXZWVrW3N0ZXBzQnlXZWVrLmxlbmd0aCAtIDFdLnB1c2ggc3RlcFxuXG4gICAgICByZXR1cm4gc3RlcHNCeVdlZWtcblxuICAgIHNjb3BlLiR3YXRjaEdyb3VwKFsnbWluRGF0ZScsICdtYXhEYXRlJywgJ3N0ZXBzJ10sIC0+XG4gICAgICByZXR1cm4gaWYgbm90IHNjb3BlLnN0ZXBzP1xuICAgICAgZm9yIHN0ZXAgaW4gc2NvcGUuc3RlcHNcbiAgICAgICAgc3RlcERhdGUgPSBtb21lbnQoc3RlcC52YWx1ZSlcbiAgICAgICAgYWZ0ZXJNaW5pbXVtID0gaWYgc2NvcGUubWluRGF0ZT8gdGhlbiBzdGVwRGF0ZS5pc0FmdGVyKHNjb3BlLm1pbkRhdGUsIHNjb3BlLnZpZXcpIGVsc2UgdHJ1ZVxuICAgICAgICBiZWZvcmVNYXhpbXVtID0gaWYgc2NvcGUubWF4RGF0ZT8gdGhlbiBzdGVwRGF0ZS5pc0JlZm9yZShzY29wZS5tYXhEYXRlLCBzY29wZS52aWV3KSBlbHNlIHRydWVcbiAgICAgICAgc3RlcC5zZWxlY3RhYmxlID0gYWZ0ZXJNaW5pbXVtIGFuZCBiZWZvcmVNYXhpbXVtXG4gICAgKVxuXG4gICAgc2NvcGUuJHdhdGNoKCdhY3RpdmVCZWZvcmUgKyBhY3RpdmVBZnRlciArIHN0ZXBzLmxlbmd0aCcsIC0+XG4gICAgICByZXR1cm4gaWYgbm90IHNjb3BlLnN0ZXBzP1xuICAgICAgZm9yIHN0ZXAgaW4gc2NvcGUuc3RlcHNcbiAgICAgICAgc3RlcERhdGUgPSBtb21lbnQoc3RlcC52YWx1ZSlcbiAgICAgICAgaWYgbm90IHNjb3BlLmFjdGl2ZUJlZm9yZT8gYW5kIG5vdCBzY29wZS5hY3RpdmVBZnRlcj9cbiAgICAgICAgICBzdGVwLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpZiBzY29wZS5hY3RpdmVCZWZvcmU/XG4gICAgICAgICAgICBpc0JlZm9yZSA9IHN0ZXBEYXRlLmlzQmVmb3JlKHNjb3BlLmFjdGl2ZUJlZm9yZSwgc2NvcGUudmlldykgb3Igc3RlcERhdGUuaXNTYW1lKHNjb3BlLmFjdGl2ZUJlZm9yZSxcbiAgICAgICAgICAgICAgICBzY29wZS52aWV3KVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlzQmVmb3JlID0gdHJ1ZVxuICAgICAgICAgIGlmIHNjb3BlLmFjdGl2ZUFmdGVyP1xuICAgICAgICAgICAgaXNBZnRlciA9IHN0ZXBEYXRlLmlzQWZ0ZXIoc2NvcGUuYWN0aXZlQWZ0ZXIsIHNjb3BlLnZpZXcpIG9yIHN0ZXBEYXRlLmlzU2FtZShzY29wZS5hY3RpdmVBZnRlciwgc2NvcGUudmlldylcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBpc0FmdGVyID0gdHJ1ZVxuXG4gICAgICAgICAgc3RlcC5hY3RpdmUgPSBpc0JlZm9yZSBhbmQgaXNBZnRlclxuICAgIClcblxuICAgIHNjb3BlLiR3YXRjaCgnc2VsZWN0ZWQgKyBzdGVwcy5sZW5ndGgnLCAtPlxuICAgICAgcmV0dXJuIGlmIG5vdCBzY29wZS5zdGVwcz9cblxuICAgICAgZm9yIHN0ZXAgaW4gc2NvcGUuc3RlcHNcbiAgICAgICAgc3RlcC5zZWxlY3RlZCA9IG1vbWVudChzdGVwLnZhbHVlKS5pc1NhbWUoc2NvcGUuc2VsZWN0ZWQsIHNjb3BlLnZpZXcpXG5cbiAgICAgIHNjb3BlLiRjYW5OZXh0ID0gY2FuTmV4dFZpZXcoKVxuICAgICAgc2NvcGUuJGNhblByZXZpb3VzID0gY2FuUHJldmlvdXNWaWV3KClcbiAgICApXG5cbiAgICBzY29wZS4kd2F0Y2goJ3Bvc2l0aW9uICsgdmlldycsIC0+XG4gICAgICAjIFBvc2l0aW9uIG9ubHkuXG4gICAgICBzdGVwID0gc3RlcHNbc2NvcGUudmlld11cbiAgICAgIHN0ZXBEYXRlID0gc3RlcC5maXJzdChtb21lbnQoc2NvcGUucG9zaXRpb24pKVxuICAgICAgcGVyaW9kID0gc3RlcC5zdGVwXG4gICAgICBhbW91bnQgPSBzdGVwLmFtb3VudFxuXG4gICAgICBzY29wZS5zdGVwcyA9IGZvciBpIGluIFswLi5hbW91bnQgLSAxXSBieSAxXG4gICAgICAgIGN1cnJlbnRTdGVwID0ge1xuICAgICAgICAgIHBhc3Q6IHN0ZXAuY29tcGFyZShzdGVwRGF0ZSwgc2NvcGUucG9zaXRpb24pIDwgMFxuICAgICAgICAgIGZ1dHVyZTogc3RlcC5jb21wYXJlKHN0ZXBEYXRlLCBzY29wZS5wb3NpdGlvbikgPiAwXG4gICAgICAgICAgZm9ybWF0dGVkOiBtb21lbnQoc3RlcERhdGUpLmZvcm1hdChzdGVwLmZvcm1hdClcbiAgICAgICAgICB2YWx1ZTogbW9tZW50KHN0ZXBEYXRlKS50b0RhdGUoKVxuICAgICAgICB9XG4gICAgICAgIHN0ZXBEYXRlLmFkZChwZXJpb2QpXG4gICAgICAgIGN1cnJlbnRTdGVwXG5cbiAgICAgIHNjb3BlLmJ5V2Vla3MgPSBzcGxpdEJ5V2Vla3Moc2NvcGUuc3RlcHMpIGlmIHNjb3BlLnZpZXcgPT0gJ2RheSdcbiAgICAgIHJldHVyblxuICAgIClcblxuXG4gICAgI1xuICAgICMgUmV0dXJuIHRoZSBuZXh0IHZpZXcgdmFsdWUuXG4gICAgI1xuICAgIG5leHRWaWV3VmFsdWUgPSAodmlldykgLT5cbiAgICAgIGluZGV4ID0gdmlld3MuaW5kZXhPZih2aWV3KVxuICAgICAgaWYgaW5kZXggPT0gLTFcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHZpZXcgXFxcIlwiICsgdmlldyArIFwiXFxcIiBpcyBpbnZhbGlkXCIpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIGluZGV4KysgPCB2aWV3cy5sZW5ndGhcbiAgICAgICAgICB2aWV3c1tpbmRleF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZpZXdzWy0xLi5dXG5cbiAgICBzY29wZS5uZXh0VmlldyA9IChldmVudCkgLT5cbiAgICAgIGlmIGV2ZW50P1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIHNjb3BlLnN3aXRjaFZpZXcoXG4gICAgICAgIG5leHRWaWV3VmFsdWUoXG4gICAgICAgICAgc2NvcGUudmlld1xuICAgICAgICApXG4gICAgICApXG5cbiAgICAjXG4gICAgIyBSZXR1cm4gdGhlIG5leHQgdmlldyB2YWx1ZS5cbiAgICAjXG4gICAgcHJldmlvdXNWaWV3VmFsdWUgPSAodmlldykgLT5cbiAgICAgIGluZGV4ID0gdmlld3MuaW5kZXhPZih2aWV3KVxuICAgICAgaWYgaW5kZXggPT0gLTFcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHZpZXcgXFxcIlwiICsgdmlldyArIFwiXFxcIiBpcyBpbnZhbGlkXCIpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIGluZGV4LS0gPiAwXG4gICAgICAgICAgdmlld3NbaW5kZXhdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB2aWV3c1swXVxuXG4gICAgIyBUT0RPOiBSZW5hbWUgdG8gdmlld1ByZXZpb3VzXG4gICAgc2NvcGUucHJldmlvdXNWaWV3ID0gKGV2ZW50KSAtPlxuICAgICAgaWYgZXZlbnQ/XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgICAgc2NvcGUuc3dpdGNoVmlldyhcbiAgICAgICAgcHJldmlvdXNWaWV3VmFsdWUoXG4gICAgICAgICAgc2NvcGUudmlld1xuICAgICAgICApXG4gICAgICApXG5cbiAgICBzY29wZS5zd2l0Y2hWaWV3ID0gKHZpZXcsIGV2ZW50KS0+XG4gICAgICBpZiBldmVudD9cbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBzY29wZS52aWV3ID0gdmlld1xuXG4gIHJlc3RyaWN0OiAnRSdcbiAgdGVtcGxhdGU6IFwiXCJcIlxuPGRpdiBuZy1rZXlkb3duPVwia2V5UHJlc3MoJGV2ZW50KVwiIGNsYXNzPVwiZGF0ZXRpbWVwaWNrZXIgdGFibGUtcmVzcG9uc2l2ZVwiPlxuPHRhYmxlICBjbGFzcz1cInRhYmxlIHt7IHZpZXcgfX0tdmlld1wiPlxuICAgPHRoZWFkPlxuICAgICAgIDx0cj5cbiAgICAgICAgICAgPHRoIGNsYXNzPVwibGVmdFwiIGRhdGEtbmctY2xpY2s9XCJwcmV2aW91cygkZXZlbnQpXCIgZGF0YS1uZy1zaG93PVwiJGNhblByZXZpb3VzXCI+PGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLWFycm93LWxlZnRcIi8+PC90aD5cbiAgICAgICAgICAgPHRoIGNsYXNzPVwic3dpdGNoXCIgY29sc3Bhbj1cIjVcIiBkYXRhLW5nLWNsaWNrPVwicHJldmlvdXNWaWV3KCRldmVudClcIj5cbiAgICAgICAgICAgICAgIDxzcGFuIG5nLXJlcGVhdD1cInRva2VuIGluIHRva2Vuc1wiIGNsYXNzPVwie3sgdG9rZW4udmlldyB9fSB7eyB0b2tlbi52aWV3ID09PSB2aWV3ICYmICdjdXJyZW50JyB8fCAnJyB9fSBcIiA+XG4gICAgICAgICAgICAgICAgIDxhIG5nLWlmPVwidG9rZW4udmlld1wiIG5nLWNsaWNrPVwic3dpdGNoVmlldyh0b2tlbi52aWV3LCAkZXZlbnQpXCI+e3sgcG9zaXRpb24gfCBkYXRlOnRva2VuLmZvcm1hdCB9fTwvYT5cbiAgICAgICAgICAgICAgICAgPHNwYW4gbmctaWY9XCIhdG9rZW4udmlld1wiPnt7IHRva2VuLnZhbHVlIH19PC9zcGFuPlxuICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICA8L3RoPlxuICAgICAgICAgICA8dGggY2xhc3M9XCJyaWdodFwiIGRhdGEtbmctY2xpY2s9XCJuZXh0KCRldmVudClcIiBkYXRhLW5nLXNob3c9XCIkY2FuTmV4dFwiPjxpIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1hcnJvdy1yaWdodFwiLz48L3RoPlxuICAgICAgIDwvdHI+XG4gICAgICAgPHRyIGRhdGEtbmctc2hvdz1cInZpZXcgPT09ICdkYXknXCI+XG4gICAgICAgICAgIDx0aCBjbGFzcz1cImRvd1wiIGRhdGEtbmctcmVwZWF0PVwiZGF5IGluIGRvd1wiID57eyBkYXkgfX08L3RoPlxuICAgICAgIDwvdHI+XG4gICA8L3RoZWFkPlxuICAgPHRib2R5PlxuICAgICAgIDx0ciBkYXRhLW5nLWlmPVwidmlldyAhPT0gJ2RheSdcIiA+XG4gICAgICAgICAgIDx0ZCBjb2xzcGFuPVwiN1wiID5cbiAgICAgICAgICAgICAgPHNwYW4gICAgY2xhc3M9XCJ7eyB2aWV3IH19XCJcbiAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1uZy1yZXBlYXQ9XCJzdGVwIGluIHN0ZXBzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1uZy1jbGFzcz1cInthY3RpdmU6IHN0ZXAuYWN0aXZlLCBwYXN0OiBzdGVwLnBhc3QsIGZ1dHVyZTogc3RlcC5mdXR1cmUsIGRpc2FibGVkOiAhc3RlcC5zZWxlY3RhYmxlfVwiXG4gICAgICAgICAgICAgICAgICAgICAgIGRhdGEtbmctY2xpY2s9XCJzZWxlY3Qoc3RlcCwkZXZlbnQpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1uZy1tb3VzZWVudGVyPVwiaG92ZXIoc3RlcCwkZXZlbnQpXCI+e3sgc3RlcC5mb3JtYXR0ZWQgfX08L3NwYW4+XG4gICAgICAgICAgIDwvdGQ+XG4gICAgICAgPC90cj5cbiAgICAgICA8dHIgZGF0YS1uZy1pZj1cInZpZXcgPT09ICdkYXknXCIgZGF0YS1uZy1yZXBlYXQ9XCJ3ZWVrcyBpbiBieVdlZWtzXCI+XG4gICAgICAgICAgIDx0ZCBkYXRhLW5nLXJlcGVhdD1cInN0ZXAgaW4gd2Vla3NcIlxuICAgICAgICAgICAgICAgZGF0YS1uZy1jbGljaz1cInNlbGVjdChzdGVwLCRldmVudClcIlxuICAgICAgICAgICAgICAgZGF0YS1uZy1tb3VzZWVudGVyPVwiaG92ZXIoc3RlcCwkZXZlbnQpXCJcbiAgICAgICAgICAgICAgIGNsYXNzPVwiZGF5XCJcbiAgICAgICAgICAgICBkYXRhLW5nLWNsYXNzPVwie2FjdGl2ZTogc3RlcC5hY3RpdmUsIHBhc3Q6IHN0ZXAucGFzdCwgZnV0dXJlOiBzdGVwLmZ1dHVyZSwgZGlzYWJsZWQ6ICFzdGVwLnNlbGVjdGFibGV9XCI+e3sgc3RlcC5mb3JtYXR0ZWQgfX08L3RkPlxuICAgICAgIDwvdHI+XG4gICA8L3Rib2R5PlxuPC90YWJsZT5cbjwvZGl2PlxuXCJcIlwiXG5cblxuICB9XG5dXG5cblxuIyMjXG4gICAgQSBkaXJlY3RpdmUgdGhhdCBhbGxvdyB0aGUgc2VsZWN0aW9uIG9mIHR3byBkYXRldGltZSB2YWx1ZXMuXG4jIyNcbm1vZHVsZS5kaXJlY3RpdmUgJ3BlcmlvZERhdGV0aW1lUGlja2VyJywgWydkYXRlVGltZVBpY2tlckNvbmZpZycsIChkZWZhdWx0Q29uZmlnKS0+XG4gIHJldHVybiB7XG4gIHNjb3BlOiB7XG4gICAgbWluRGF0ZTogJz0/JyAgICAgIyBtaW5pbXVtIHNlbGVjdGlvbm5hYmxlIGRhdGUuXG4gICAgbWF4RGF0ZTogJz0/JyAgICAgIyBtYXhpbXVtIHNlbGVjdGlvbm5hYmxlIGRhdGUuXG4gICAgdmlldzogJz0/J1xuICAgIHRva2VuczogJyYnXG4gICAgcG9zaXRpb246ICc9PycgICAgIyBEZWZhdWx0IHRvIG5nLW1vZGVsLlxuICAgIGZyb206IFwiPVwiXG4gICAgdG86IFwiPVwiXG4gIH1cbiAgcmVwbGFjZTogdHJ1ZVxuICBsaW5rOiAoc2NvcGUsIGVsbSwgYXR0ciktPlxuXG5cbiAgICAjIFRoaXMgc2hvdWxkIGJlIGNhbGN1bGF0ZWQgRC4gTSBZWVlZXG4gICAgc2NvcGUudG9rZW5zID0gaWYgbm90IHNjb3BlLnRva2VucygpPyB0aGVuIHtcbiAgICBkYXk6IFt7Zm9ybWF0OiAnTU1NTScsIHZpZXc6ICdtb250aCd9LCB7Zm9ybWF0OiAnICd9LHtmb3JtYXQ6ICd5eXl5JywgdmlldzogJ3llYXInfV1cbiAgICBtb250aDogW3tmb3JtYXQ6ICdNTU1NJywgdmlldzogJ21vbnRoJ30sIHtmb3JtYXQ6ICcgJ30se2Zvcm1hdDogJ3l5eXknLCB2aWV3OiAneWVhcid9XVxuICAgIH0gZWxzZSBzY29wZS50b2tlbnMoKVxuXG5cbiAgICAjIFRoZSBzZWxlY3RlZCBkYXRlcyBpbiB0aGUgdGhyZWUgZGF0ZXRpbWVwaWNrZXIuXG4gICAgc2NvcGUubGVmdCA9IHNjb3BlLm1pZGRsZSA9IHNjb3BlLnJpZ2h0ID0gbnVsbFxuICAgIHNjb3BlLmxlZnRQb3MgPSBzY29wZS5taWRkbGVQb3MgPSBzY29wZS5sZWZ0UG9zID0gbW9tZW50KCkudG9EYXRlKCkgaWYgbm90IHNjb3BlLnBvc2l0aW9uP1xuICAgIHNjb3BlLmhvdmVyZWQgPSBudWxsXG4gICAgc2NvcGUudmlldyA9ICdkYXknXG4gICAgc2NvcGUubGFhID0gc2NvcGUubGFiID0gc2NvcGUubWFhID0gc2NvcGUubWFiID0gc2NvcGUucmFhID0gc2NvcGUucmFiID0gbnVsbFxuXG4gICAgc2NvcGUuJHdhdGNoKCdmcm9tICsgdG8gKyBwb3NpdGlvbicsIC0+XG4gICAgICByZXR1cm4gdW5sZXNzIHNjb3BlLmZyb20/IGFuZCBzY29wZS50bz9cblxuICAgICAgZnJvbSA9IG1vbWVudChzY29wZS5mcm9tKVxuICAgICAgdG8gPSBtb21lbnQoc2NvcGUudG8pXG5cbiAgICAgICMgTWFrZSBzdXJlIHdlIGFsd2F5cyBzdGFydCB3aXRoIHRoZSBsYXJnZXN0LlxuICAgICAgW2Zyb20sIHRvXSA9IFt0bywgZnJvbV0gaWYgdG8gPCBmcm9tXG5cbiAgICAgIHNjb3BlLnJhYiA9IHNjb3BlLm1hYiA9IHNjb3BlLmxhYiA9IHRvLnRvRGF0ZSgpXG4gICAgICBzY29wZS5yYWEgPSBzY29wZS5tYWEgPSBzY29wZS5sYWEgPSBmcm9tLnRvRGF0ZSgpXG4gICAgKVxuXG4gICAgIyBTdGVwcyBiZXR3ZWVuIHRoZSB0aHJlZSBkaXJlY3RpdmVzLCBzdGFydGluZyBmcm9tIHRoZSByaWdodC5cbiAgICB2aWV3c1N0ZXBzID1cbiAgICAgIG1pbnV0ZTpcbiAgICAgICAgZHVyYXRpb246IG1vbWVudC5kdXJhdGlvbigxMiwgJ2hvdXInKVxuICAgICAgICBzdGVwOiBtb21lbnQuZHVyYXRpb24oNCwgJ2hvdXInKVxuICAgICAgaG91cjpcbiAgICAgICAgZHVyYXRpb246IG1vbWVudC5kdXJhdGlvbigyNCwgJ2hvdXInKVxuICAgICAgICBzdGVwOiBtb21lbnQuZHVyYXRpb24oOCwgJ2hvdXInKVxuICAgICN3ZWVrOlxuICAgICMgIGR1cmF0aW9uOm1vbWVudC5kdXJhdGlvbigzLCAnd2VlaycpXG4gICAgIyAgc3RlcDogbW9tZW50LmR1cmF0aW9uKDcsICdkYXknKVxuICAgICAgZGF5OlxuICAgICAgICBkdXJhdGlvbjogbW9tZW50LmR1cmF0aW9uKDMsICdtb250aCcpXG4gICAgICAgIHN0ZXA6IG1vbWVudC5kdXJhdGlvbigxLCAnbW9udGgnKVxuICAgICAgbW9udGg6XG4gICAgICAgIGR1cmF0aW9uOiBtb21lbnQuZHVyYXRpb24oMTIsICdtb250aCcpXG4gICAgICAgIHN0ZXA6IG1vbWVudC5kdXJhdGlvbig0LCAnbW9udGgnKVxuICAgICAgeWVhcjpcbiAgICAgICAgZHVyYXRpb246IG1vbWVudC5kdXJhdGlvbigxMDAsICd5ZWFyJylcbiAgICAgICAgc3RlcDogbW9tZW50LmR1cmF0aW9uKDQsICdtb250aCcpXG5cbiAgICBzY29wZS4kd2F0Y2goJ3Bvc2l0aW9uICsgdmlldycsIC0+XG4gICAgICBzY29wZS5sZWZ0UG9zID0gbW9tZW50KG1vbWVudChzY29wZS5wb3NpdGlvbikgLSAoMiAqIHZpZXdzU3RlcHNbc2NvcGUudmlld10uc3RlcCkpLnRvRGF0ZSgpXG4gICAgICBzY29wZS5taWRkbGVQb3MgPSBtb21lbnQobW9tZW50KHNjb3BlLnBvc2l0aW9uKSAtICgxICogdmlld3NTdGVwc1tzY29wZS52aWV3XS5zdGVwKSkudG9EYXRlKClcbiAgICAgIHNjb3BlLnJpZ2h0UG9zID0gbW9tZW50KG1vbWVudChzY29wZS5wb3NpdGlvbikgLSAoMCAqIHZpZXdzU3RlcHNbc2NvcGUudmlld10uc3RlcCkpLnRvRGF0ZSgpXG4gICAgKVxuXG4gICAgc2NvcGUuJG5leHQgPSAtPlxuICAgICAgc2NvcGUucG9zaXRpb24gPSBtb21lbnQobW9tZW50KHNjb3BlLnBvc2l0aW9uKSArIHZpZXdzU3RlcHNbc2NvcGUudmlld10uc3RlcCkudG9EYXRlKClcblxuICAgIHNjb3BlLiRwcmV2aW91cyA9IC0+XG4gICAgICBzY29wZS5wb3NpdGlvbiA9IG1vbWVudChtb21lbnQoc2NvcGUucG9zaXRpb24pIC0gdmlld3NTdGVwc1tzY29wZS52aWV3XS5zdGVwKS50b0RhdGUoKVxuXG4gICAgc2VsZWN0aW5nID0gbnVsbFxuICAgIGNoYW5nZVJhbmdlID0gKG5ld0RhdGUpIC0+XG4gICAgICBpZiBub3Qgc2VsZWN0aW5nP1xuICAgICAgICBzY29wZS5mcm9tID0gbmV3RGF0ZVxuICAgICAgICBzY29wZS50byA9IG51bGxcbiAgICAgICAgc2VsZWN0aW5nID0gc2NvcGUuJHdhdGNoKCdob3ZlcicsIChuZXdEYXRlKSAtPlxuICAgICAgICAgIHNjb3BlLnRvID0gbW9tZW50KG5ld0RhdGUpLnRvRGF0ZSgpXG4gICAgICAgIClcbiAgICAgIGVsc2VcbiAgICAgICAgc2VsZWN0aW5nKClcbiAgICAgICAgc2VsZWN0aW5nID0gbnVsbFxuXG4gICAgc2NvcGUuJHdhdGNoKCdsZWZ0JywgY2hhbmdlUmFuZ2UpXG4gICAgc2NvcGUuJHdhdGNoKCdtaWRkbGUnLCBjaGFuZ2VSYW5nZSlcbiAgICBzY29wZS4kd2F0Y2goJ3JpZ2h0JywgY2hhbmdlUmFuZ2UpXG5cblxuICByZXN0cmljdDogJ0UnXG4gIHRlbXBsYXRlOiBcIlwiXCJcbjxkaXYgY2xhc3M9J3BlcmlvZC1waWNrZXInPlxuICA8ZGl2IGNsYXNzPVwicHJldmlvdXMtYnRuXCIgbmctY2xpY2s9XCIkcHJldmlvdXMoKVwiPlxuICAgIDxhPnByZXZpb3VzPC9hPlxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cInBpY2tlcnNcIj5cbiAgICA8ZGl2IGNsYXNzPSdwaWNrZXIgbGVmdCc+XG4gICAgICA8bW9tZW50LWRhdGV0aW1lcGlja2VyIHNlbGVjdGVkPVwibGVmdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uPVwibGVmdFBvc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXc9XCJ2aWV3XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlLWJlZm9yZT1cImxhYlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZS1hZnRlcj1cImxhYVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvdmVyZWQ9XCJob3ZlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbi1kYXRlPVwibWluXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4LWRhdGU9XCJtYXhcIj5cbiAgICAgIDwvbW9tZW50LWRhdGV0aW1lcGlja2VyPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9J3BpY2tlciBtaWRkbGUnPlxuICAgICAgPG1vbWVudC1kYXRldGltZXBpY2tlciBzZWxlY3RlZD1cInJpZ2h0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb249XCJtaWRkbGVQb3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3PVwidmlld1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZS1iZWZvcmU9XCJyYWJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmUtYWZ0ZXI9XCJyYWFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3ZlcmVkPVwiaG92ZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW4tZGF0ZT1cIm1pblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heC1kYXRlPVwibWF4XCI+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz0ncGlja2VyIHJpZ2h0Jz5cbiAgICAgIDxtb21lbnQtZGF0ZXRpbWVwaWNrZXIgc2VsZWN0ZWQ9XCJtaWRkbGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbj1cInJpZ2h0UG9zXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldz1cInZpZXdcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmUtYmVmb3JlPVwibWFiXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlLWFmdGVyPVwibWFhXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG92ZXJlZD1cImhvdmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluLWRhdGU9XCJtaW5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXgtZGF0ZT1cIm1heFwiPlxuICAgICAgPC9tb21lbnQtZGF0ZXRpbWVwaWNrZXI+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuICA8ZGl2IGNsYXNzPVwibmV4dC1idG5cIiBuZy1jbGljaz1cIiRuZXh0KClcIj5cbiAgICA8YT5uZXh0PC9hPlxuICA8L2Rpdj5cbjwvZGl2PlxuXCJcIlwiXG4gIH1cbl1cbiJdfQ==