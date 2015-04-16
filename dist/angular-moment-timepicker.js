
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
          mdFormat: '&',
          minDate: '=?',
          maxDate: '=?',
          currentView: '=?',
          commitView: '&',
          afterSelect: '&'
        },
        require: 'ngModel',
        replace: true,
        link: function(scope, elm, attr, ngModel) {
          var afterSelect, canNextView, canPreviousView, goDown, goLeft, goRight, goUp, nextViewValue, onSelectDisabled, onSelectFuture, onSelectPast, onSelectUnselectable, previousViewValue, splitByWeeks, steps, views;
          scope.currentView = scope.currentView != null ? 'year' : void 0;
          defaultConfig;
          goLeft = function() {
            return -steps[scope.currentView].step;
          };
          goRight = function() {
            return steps[scope.currentView].step;
          };
          goDown = function() {
            return steps[scope.currentView].line;
          };
          goUp = function() {
            return -steps[scope.currentView].line;
          };
          scope.keyPress = function($event) {
            switch ($event.keyCode) {
              case 39:
                return scope.selectDate(scope.date.add(goRight()), $event);
              case 40:
                return scope.selectDate(scope.date.add(goDown()), $event);
              case 37:
                return scope.selectDate(scope.date.add(goLeft()), $event);
              case 38:
                return scope.selectDate(scope.date.add(goUp()), $event);
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
          ngModel.$render = function() {
            return scope.date = moment(ngModel.$modelValue) || moment();
          };
          afterSelect = angular.noop;
          onSelectDisabled = function(step, $event) {
            return console.log("Clicked on a disabled date.");
          };
          onSelectFuture = function(step, $event) {
            return console.log("Clicked on a future date.");
          };
          onSelectPast = function(step, $event) {
            return console.log("Clicked on a past date.");
          };
          onSelectUnselectable = function(step, $event) {
            return console.log("Clicked on a date outside the range");
          };
          views = ['year', 'month', 'day', 'hour', 'minute', 'second'];
          steps = defaultConfig;
          scope.dow = moment.weekdaysShort();
          scope.selectDate = function(date, event) {
            if (event != null) {
              event.stopPropagation();
              event.preventDefault();
            }
            date = date.value != null ? moment(date.value) : moment(date);
            scope.date = date;
            if (event != null) {
              return afterSelect(scope);
            }
          };
          scope.setDate = function(date) {
            return scope.date = date;
          };
          scope.next = function(event) {
            var date, offset;
            if (event != null) {
              event.stopPropagation();
              event.preventDefault();
            }
            date = moment(scope.date);
            offset = steps[scope.currentView].next;
            date.add(offset);
            return scope.setDate(date);
          };
          scope.previous = function(event) {
            var date, offset;
            if (event != null) {
              event.stopPropagation();
              event.preventDefault();
            }
            date = moment(scope.date);
            offset = steps[scope.currentView].previous;
            date.add(offset);
            return scope.setDate(date);
          };
          scope.currentView = 'month';
          scope.tokens = [
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
          ];

          /*
            Helper method that split the steps by week
           */
          splitByWeeks = function(steps) {
            var j, lastWeek, len, step, stepsByWeek, week;
            if (steps == null) {
              steps = [];
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
          scope.$watch('currentView + date + minDate + maxDate + currentView', function() {
            var after, amount, before, i, lowerDate, newDate, period, same, step, stepDate, upperDate;
            step = steps[scope.currentView];
            stepDate = step.first(moment(scope.date));
            period = step.step;
            amount = step.amount;
            lowerDate = moment(scope.date).startOf(scope.currentView);
            upperDate = moment(scope.date).add(1, scope.currentView);
            scope.steps = (function() {
              var j, ref, results;
              results = [];
              for (i = j = 1, ref = amount; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
                before = scope.minDate != null ? stepDate.isBefore(scope.minDate, scope.currentView) : true;
                after = scope.maxDate != null ? stepDate.isAfter(scope.maxDate, scope.currentView) : true;
                same = stepDate.isSame(scope.date, scope.currentView);
                newDate = {
                  selectable: !(before && after),
                  active: same,
                  past: stepDate.isBefore(lowerDate),
                  future: stepDate.isBefore(upperDate),
                  formatted: stepDate.format(step.format),
                  value: stepDate.toDate()
                };
                stepDate = moment(stepDate).add(period);
                results.push(newDate);
              }
              return results;
            })();
            scope.stepsByWeek = splitByWeeks(scope.steps);
            scope.$canNext = canNextView();
            return scope.$canPrevious = canPreviousView();
          });
          canNextView = function() {
            if (scope.maxDate == null) {
              return true;
            } else {
              return moment(scope.date).add(steps[scope.currentView].next).isBefore(scope.maxDate);
            }
          };
          canPreviousView = function() {
            if (scope.minDate == null) {
              return true;
            } else {
              return moment(scope.date).add(steps[scope.currentView].previous).isAfter(scope.minDate);
            }
          };
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
            return scope.switchView(nextViewValue(scope.currentView));
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
            return scope.switchView(previousViewValue(scope.currentView));
          };
          return scope.switchView = function(view, event) {
            if (event != null) {
              event.stopPropagation();
              event.preventDefault();
            }
            return scope.currentView = view;
          };
        },
        restrict: 'E',
        template: "<div tabindex=\"0\" ng-keydown=\"keyPress($event)\" class=\"datetimepicker table-responsive\">\n<table  class=\"table table-striped  {{ currentView }}-view\">\n   <thead>\n       <tr>\n           <th class=\"left\" data-ng-click=\"previous($event)\" data-ng-show=\"$canPrevious\"><i class=\"glyphicon glyphicon-arrow-left\"/></th>\n           <th class=\"switch\" colspan=\"5\" data-ng-click=\"previousView($event)\">\n               <span ng-repeat=\"token in tokens\" class=\"{{ token.view }} {{ token.view === currentView && 'current' || '' }} \" >\n                 <a ng-if=\"token.view\" ng-click=\"switchView(token.view, $event)\">{{ date.toDate() | date:token.format }}</a>\n                 <span ng-if=\"!token.view\">{{ token.value }}</span>\n               </span>\n           </th>\n           <th class=\"right\" data-ng-click=\"next($event)\" data-ng-show=\"$canNext\"><i class=\"glyphicon glyphicon-arrow-right\"/></th>\n       </tr>\n       <tr data-ng-show=\"currentView === 'day\">\n           <th class=\"dow\" data-ng-repeat=\"day in dow\" >{{ day }}</th>\n       </tr>\n   </thead>\n   <tbody>\n       <tr data-ng-if=\"currentView !== 'day'\" >\n           <td colspan=\"7\" >\n              <span    class=\"{{ currentView }}\"\n                       data-ng-repeat=\"step in steps\"\n                       data-ng-class=\"{active: step.active, past: step.past, future: step.future, disabled: !step.selectable}\"\n                       data-ng-click=\"selectDate(step,$event)\">{{ step.formatted }}</span>\n           </td>\n       </tr>\n       <tr data-ng-if=\"currentView === 'day'\" data-ng-repeat=\"week in stepsByWeek\">\n           <td data-ng-repeat=\"step in week\"\n               data-ng-click=\"selectDate(step,$event)\"\n               class=\"day\"\n             data-ng-class=\"{active: step.active, past: step.past, future: step.future, disabled: !step.selectable}\">{{ step.formatted }}</td>\n       </tr>\n   </tbody>\n</table>\n</div>"
      };
    }
  ]);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuZ3VsYXItbW9tZW50LXRpbWVwaWNrZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUE7Ozs7R0FBQTtBQUFBO0FBQUE7QUFBQSxNQUFBLE1BQUE7O0FBQUEsRUFLQSxNQUFBLEdBQVMsT0FBTyxDQUFDLE1BQVIsQ0FBZSxvQ0FBZixFQUFxRCxFQUFyRCxDQUxULENBQUE7O0FBQUEsRUFVQSxNQUFNLENBQUMsUUFBUCxDQUFnQixzQkFBaEIsRUFBd0M7QUFBQSxJQUN0QyxJQUFBLEVBQ0U7QUFBQSxNQUFBLE1BQUEsRUFBUSxNQUFSO0FBQUEsTUFDQSxLQUFBLEVBQU8sU0FBQyxJQUFELEdBQUE7ZUFDTCxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQUEsQ0FBUyxJQUFJLENBQUMsSUFBTCxDQUFBLENBQUEsR0FBYyxFQUF2QixFQUEyQixFQUEzQixDQUFBLEdBQWlDLEVBQTNDLEVBREs7TUFBQSxDQURQO0FBQUEsTUFHQSxNQUFBLEVBQVEsRUFIUjtBQUFBLE1BSUEsSUFBQSxFQUFNLE1BQU0sQ0FBQyxRQUFQLENBQWdCLENBQWhCLEVBQW1CLE1BQW5CLENBSk47QUFBQSxNQUtBLElBQUEsRUFBTSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFoQixFQUFtQixNQUFuQixDQUxOO0FBQUEsTUFNQSxRQUFBLEVBQVUsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBQSxFQUFoQixFQUFxQixNQUFyQixDQU5WO0FBQUEsTUFPQSxJQUFBLEVBQU0sTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsRUFBaEIsRUFBb0IsTUFBcEIsQ0FQTjtLQUZvQztBQUFBLElBVXRDLEtBQUEsRUFDRTtBQUFBLE1BQUEsTUFBQSxFQUFRLFFBQVI7QUFBQSxNQUNBLEtBQUEsRUFBTyxTQUFDLElBQUQsR0FBQTtlQUNMLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxFQURLO01BQUEsQ0FEUDtBQUFBLE1BR0EsTUFBQSxFQUFRLEVBSFI7QUFBQSxNQUlBLElBQUEsRUFBTSxN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QSxLQUFLLENBQUMsZUFBTixDQUFBLENBQUEsQ0FBQTtBQUFBLGNBQ0EsS0FBSyxDQUFDLGNBQU4sQ0FBQSxDQURBLENBREY7YUFBQTttQkFJQSxLQUFLLENBQUMsV0FBTixHQUFvQixLQUxIO1VBQUEsRUE1T2Y7UUFBQSxDQVhDO0FBQUEsUUE4UFAsUUFBQSxFQUFVLEdBOVBIO0FBQUEsUUErUFAsUUFBQSxFQUFVLDY3REEvUEg7T0FBUCxDQURnRTtJQUFBLENBQXpCO0dBQXpDLENBdkVBLENBQUE7QUFBQSIsImZpbGUiOiJhbmd1bGFyLW1vbWVudC10aW1lcGlja2VyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gICAgYW5ndWxhci1tb21lbnQtZGF0ZXRpbWVwaWNrZXJcblxuICAgIEEgaGlnaGx5IGV4dGVuc2libGUgZGF0ZSB0aW1lIHBpY2tlciBkaXJlY3RpdmUuXG4jIyNcbm1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlICd1aS5ib290c3RyYXAubW9tZW50LmRhdGV0aW1lcGlja2VyJywgW11cblxuI1xuIyBDb250YWluIGRlZmF1bHQgcGFyYW1ldGVycyBmb3IgdGhlIGRpcmVjdGl2ZVxuI1xubW9kdWxlLmNvbnN0YW50KCdkYXRlVGltZVBpY2tlckNvbmZpZycsIHtcbiAgeWVhcjpcbiAgICBmb3JtYXQ6ICdZWVlZJ1xuICAgIGZpcnN0OiAoZGF0ZSkgLT5cbiAgICAgIGRhdGUueWVhcihwYXJzZUludChkYXRlLnllYXIoKSAvIDEwLCAxMCkgKiAxMClcbiAgICBhbW91bnQ6IDEyXG4gICAgbGluZTogbW9tZW50LmR1cmF0aW9uKDQsICd5ZWFyJylcbiAgICBzdGVwOiBtb21lbnQuZHVyYXRpb24oMSwgJ3llYXInKVxuICAgIHByZXZpb3VzOiBtb21lbnQuZHVyYXRpb24oLTEwLCAneWVhcicpXG4gICAgbmV4dDogbW9tZW50LmR1cmF0aW9uKDEwLCAneWVhcicpXG4gIG1vbnRoOlxuICAgIGZvcm1hdDogJ01NTSBZWSdcbiAgICBmaXJzdDogKGRhdGUpIC0+XG4gICAgICBkYXRlLm1vbnRoKDApXG4gICAgYW1vdW50OiAxMlxuICAgIGxpbmU6IG1vbWVudC5kdXJhdGlvbig0LCAnbW9udGgnKVxuICAgIHN0ZXA6IG1vbWVudC5kdXJhdGlvbigxLCAnbW9udGgnKVxuICAgIHByZXZpb3VzOiBtb21lbnQuZHVyYXRpb24oLTEsICd5ZWFyJylcbiAgICBuZXh0OiBtb21lbnQuZHVyYXRpb24oMSwgJ3llYXInKVxuICBkYXk6XG4gICAgZm9ybWF0OiAnRCdcbiAgICBmaXJzdDogKGRhdGUpIC0+XG4gICAgICBkYXRlLmRhdGUoMSlcbiAgICAgIGRhdGUuc3VidHJhY3QoTWF0aC5hYnMoZGF0ZS53ZWVrZGF5KCkpLCAnZGF5cycpXG4gICAgYW1vdW50OiA0MlxuICAgIGxpbmU6IG1vbWVudC5kdXJhdGlvbig3LCAnZGF5JylcbiAgICBzdGVwOiBtb21lbnQuZHVyYXRpb24oMSwgJ2RheScpXG4gICAgcHJldmlvdXM6IG1vbWVudC5kdXJhdGlvbigtMSwgJ21vbnRoJylcbiAgICBuZXh0OiBtb21lbnQuZHVyYXRpb24oMSwgJ21vbnRoJylcbiAgaG91cjpcbiAgICBmb3JtYXQ6ICdoaDptbSdcbiAgICBmaXJzdDogKGRhdGUpIC0+XG4gICAgICBkYXRlLmhvdXJzKDApLm1pbnV0ZXMoMClcbiAgICBhbW91bnQ6IDI0XG4gICAgbGluZTogbW9tZW50LmR1cmF0aW9uKDQsICdob3VyJylcbiAgICBzdGVwOiBtb21lbnQuZHVyYXRpb24oMSwgJ2hvdXInKVxuICAgIHByZXZpb3VzOiBtb21lbnQuZHVyYXRpb24oLTEsICdkYXknKVxuICAgIG5leHQ6IG1vbWVudC5kdXJhdGlvbigxLCAnZGF5JylcbiAgbWludXRlOlxuICAgIGZvcm1hdDogJ2hoOm1tJ1xuICAgIGZpcnN0OiAoZGF0ZSkgLT5cbiAgICAgIGRhdGUuaG91cnMoMCkubWludXRlcygwKVxuICAgIGFtb3VudDogMjRcbiAgICBsaW5lOiBtb21lbnQuZHVyYXRpb24oMiwgJ2hvdXInKVxuICAgIHN0ZXA6IG1vbWVudC5kdXJhdGlvbigxNSwgJ21pbnV0ZScpXG4gICAgcHJldmlvdXM6IG1vbWVudC5kdXJhdGlvbigtMSwgJ2hvdXInKVxuICAgIG5leHQ6IG1vbWVudC5kdXJhdGlvbigxLCAnaG91cicpXG4gIHNlY29uZDpcbiAgICBmb3JtYXQ6ICdoaDptbTpzcydcbiAgICBmaXJzdDogKGRhdGUpIC0+XG4gICAgICBkYXRlLmhvdXJzKDApLm1pbnV0ZXMoMCkuc2Vjb25kcyhwYXJzZUludChkYXRlLnNlY29uZHMoKSAvIDE1LCAxMCkgKiAxNSlcbiAgICBhbW91bnQ6IDQgKiAzXG4gICAgbGluZTogbW9tZW50LmR1cmF0aW9uKDIwLCAnc2Vjb25kJylcbiAgICBzdGVwOiBtb21lbnQuZHVyYXRpb24oNSwgJ3NlY29uZCcpXG4gICAgcHJldmlvdXM6IG1vbWVudC5kdXJhdGlvbigtMSwgJ2hvdXInKVxuICAgIG5leHQ6IG1vbWVudC5kdXJhdGlvbigxLCAnaG91cicpXG59KVxuXG4jXG4jIG1vbWVudCBkYXRldGltZXBpY2tlciBkaXJlY3RpdmUuXG4jXG5tb2R1bGUuZGlyZWN0aXZlICdtb21lbnREYXRldGltZXBpY2tlcicsIFsnZGF0ZVRpbWVQaWNrZXJDb25maWcnLCAoZGVmYXVsdENvbmZpZyktPlxuICByZXR1cm4ge1xuICBzY29wZToge1xuICAgIG1kRm9ybWF0OiAnJicgICAgICMgbW9tZW50IGZvcm1hdCBzdHJpbmcgdXNlIHRvIGZvcm1hdCB0aGUgY3VycmVudCBkYXRlLlxuICAgIG1pbkRhdGU6ICc9PycgICAgICMgbWluaW11bSBzZWxlY3Rpb25hYmxlIGRhdGUuXG4gICAgbWF4RGF0ZTogJz0/JyAgICAgIyBtYXhpbXVtIHNlbGVjdGlvbmFibGUgZGF0ZS5cbiAgICBjdXJyZW50VmlldzogJz0/JyAjXG4gICAgY29tbWl0VmlldzogJyYnICAgI1xuICAgIGFmdGVyU2VsZWN0OiAnJidcbiAgfVxuICByZXF1aXJlOiAnbmdNb2RlbCdcbiAgcmVwbGFjZTogdHJ1ZVxuICBsaW5rOiAoc2NvcGUsIGVsbSwgYXR0ciwgbmdNb2RlbCktPlxuICAgIHNjb3BlLmN1cnJlbnRWaWV3ID0gaWYgc2NvcGUuY3VycmVudFZpZXc/IHRoZW4gJ3llYXInXG5cbiAgICAjIFRPRE86IENPTkZJR1xuICAgIGRlZmF1bHRDb25maWdcblxuICAgICNcbiAgICAjIEhlbHBlciBmdW5jdGlvbnMgcmV0dXJuaW5nIHRoZSBkdXJhdGlvbnNcbiAgICAjIHJlcXVpcmVkIHRvIG1vdmUgd2l0aCB0aGUga2V5Ym9hcmQuXG4gICAgI1xuICAgIGdvTGVmdCA9IC0+XG4gICAgICAtc3RlcHNbc2NvcGUuY3VycmVudFZpZXddLnN0ZXBcbiAgICBnb1JpZ2h0ID0gLT5cbiAgICAgIHN0ZXBzW3Njb3BlLmN1cnJlbnRWaWV3XS5zdGVwXG4gICAgZ29Eb3duID0gLT5cbiAgICAgIHN0ZXBzW3Njb3BlLmN1cnJlbnRWaWV3XS5saW5lXG4gICAgZ29VcCA9IC0+XG4gICAgICAtc3RlcHNbc2NvcGUuY3VycmVudFZpZXddLmxpbmVcblxuICAgIHNjb3BlLmtleVByZXNzID0gKCRldmVudCkgLT5cbiAgICAgIHN3aXRjaCAkZXZlbnQua2V5Q29kZVxuICAgICAgICB3aGVuIDM5IHRoZW4gc2NvcGUuc2VsZWN0RGF0ZShzY29wZS5kYXRlLmFkZChnb1JpZ2h0KCkpLCAkZXZlbnQpXG4gICAgICAgIHdoZW4gNDAgdGhlbiBzY29wZS5zZWxlY3REYXRlKHNjb3BlLmRhdGUuYWRkKGdvRG93bigpKSwgJGV2ZW50KVxuICAgICAgICB3aGVuIDM3IHRoZW4gc2NvcGUuc2VsZWN0RGF0ZShzY29wZS5kYXRlLmFkZChnb0xlZnQoKSksICRldmVudClcbiAgICAgICAgd2hlbiAzOCB0aGVuIHNjb3BlLnNlbGVjdERhdGUoc2NvcGUuZGF0ZS5hZGQoZ29VcCgpKSwgJGV2ZW50KVxuICAgICAgICB3aGVuIDEzIHRoZW4gc2NvcGUubmV4dFZpZXcoJGV2ZW50KSAjIGVudGVyXG4gICAgICAgIHdoZW4gOCB0aGVuIHNjb3BlLnByZXZpb3VzVmlldygkZXZlbnQpICMgYmFja3NwYWNlXG4gICAgICAgIHdoZW4gOSB0aGVuIGFuZ3VsYXIubm9vcCAjdGFiXG4gICAgICAgIHdoZW4gMjcgdGhlbiBhbmd1bGFyLm5vb3AgIyBlc2NcblxuICAgICNuZ01vZGVsLiRzZXRWaWV3VmFsdWUobmV3VmFsdWUpO1xuICAgIG5nTW9kZWwuJHJlbmRlciA9IC0+XG4gICAgICBzY29wZS5kYXRlID0gbW9tZW50KG5nTW9kZWwuJG1vZGVsVmFsdWUpIHx8IG1vbWVudCgpXG5cbiAgICBhZnRlclNlbGVjdCA9IGFuZ3VsYXIubm9vcFxuXG4gICAgb25TZWxlY3REaXNhYmxlZCA9IChzdGVwLCAkZXZlbnQpIC0+XG4gICAgICBjb25zb2xlLmxvZyBcIkNsaWNrZWQgb24gYSBkaXNhYmxlZCBkYXRlLlwiXG5cbiAgICBvblNlbGVjdEZ1dHVyZSA9IChzdGVwLCAkZXZlbnQpIC0+XG4gICAgICBjb25zb2xlLmxvZyBcIkNsaWNrZWQgb24gYSBmdXR1cmUgZGF0ZS5cIlxuXG4gICAgb25TZWxlY3RQYXN0ID0gKHN0ZXAsICRldmVudCkgLT5cbiAgICAgIGNvbnNvbGUubG9nIFwiQ2xpY2tlZCBvbiBhIHBhc3QgZGF0ZS5cIlxuXG4gICAgb25TZWxlY3RVbnNlbGVjdGFibGUgPSAoc3RlcCwgJGV2ZW50KSAtPlxuICAgICAgY29uc29sZS5sb2cgXCJDbGlja2VkIG9uIGEgZGF0ZSBvdXRzaWRlIHRoZSByYW5nZVwiXG5cbiAgICAjIFNob3VsZCBvYnNlcnZlIG9uXG4gICAgIyBkYXRlIHZhbHVlLlxuICAgICMgbWluXG4gICAgIyBtYXhcbiAgICAjIGZvcm1hdFxuICAgICMgY29uZmlnXG4gICAgIyBsb2NhbGVcblxuICAgIHZpZXdzID0gW1xuICAgICAgJ3llYXInLCAnbW9udGgnLCAnZGF5JyxcbiAgICAgICdob3VyJywgJ21pbnV0ZScsICdzZWNvbmQnXG4gICAgXVxuXG4gICAgI1xuICAgICMgVXNlZCB0byBjYWxjdWxhdGUgdGhlIG5leHQgdmFsdWVzXG4gICAgI1xuICAgIHN0ZXBzID0gZGVmYXVsdENvbmZpZ1xuXG4gICAgc2NvcGUuZG93ID0gbW9tZW50LndlZWtkYXlzU2hvcnQoKVxuXG4gICAgc2NvcGUuc2VsZWN0RGF0ZSA9IChkYXRlLCBldmVudCkgLT5cbiAgICAgIGlmIGV2ZW50P1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cblxuICAgICAgZGF0ZSA9IGlmIGRhdGUudmFsdWU/IHRoZW4gbW9tZW50KGRhdGUudmFsdWUpIGVsc2UgbW9tZW50KGRhdGUpXG4gICAgICAjbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKGRhdGUudG9EYXRlKCkpO1xuICAgICAgc2NvcGUuZGF0ZSA9IGRhdGVcblxuICAgICAgYWZ0ZXJTZWxlY3Qoc2NvcGUpIGlmIGV2ZW50P1xuXG4gICAgc2NvcGUuc2V0RGF0ZSA9IChkYXRlKSAtPlxuICAgICAgc2NvcGUuZGF0ZSA9IGRhdGVcblxuICAgIHNjb3BlLm5leHQgPSAoZXZlbnQpIC0+XG4gICAgICBpZiBldmVudD9cbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBkYXRlID0gbW9tZW50KHNjb3BlLmRhdGUpXG4gICAgICBvZmZzZXQgPSBzdGVwc1tzY29wZS5jdXJyZW50Vmlld10ubmV4dFxuICAgICAgZGF0ZS5hZGQob2Zmc2V0KVxuICAgICAgc2NvcGUuc2V0RGF0ZShkYXRlKVxuXG4gICAgc2NvcGUucHJldmlvdXMgPSAoZXZlbnQpIC0+XG4gICAgICBpZiBldmVudD9cbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBkYXRlID0gbW9tZW50KHNjb3BlLmRhdGUpXG4gICAgICBvZmZzZXQgPSBzdGVwc1tzY29wZS5jdXJyZW50Vmlld10ucHJldmlvdXNcbiAgICAgIGRhdGUuYWRkKG9mZnNldClcbiAgICAgIHNjb3BlLnNldERhdGUoZGF0ZSlcblxuICAgIHNjb3BlLmN1cnJlbnRWaWV3ID0gJ21vbnRoJ1xuXG4gICAgIyBUaGlzIHNob3VsZCBiZSBjYWxjdWxhdGVkIEQuIE0gWVlZWVxuICAgIHNjb3BlLnRva2VucyA9IFtcbiAgICAgIHtmb3JtYXQ6ICdkJywgdmlldzogJ2RheSd9XG4gICAgICB7Zm9ybWF0OiAnLiAnfVxuICAgICAge2Zvcm1hdDogJ01NTU0nLCB2aWV3OiAnbW9udGgnfVxuICAgICAge2Zvcm1hdDogJyAnfVxuICAgICAge2Zvcm1hdDogJ3l5eXknLCB2aWV3OiAneWVhcid9XG4gICAgXVxuXG4gICAgIyMjXG4gICAgICBIZWxwZXIgbWV0aG9kIHRoYXQgc3BsaXQgdGhlIHN0ZXBzIGJ5IHdlZWtcbiAgICAjIyNcbiAgICBzcGxpdEJ5V2Vla3MgPSAoc3RlcHMgPSBbXSkgLT5cbiAgICAgIGxhc3RXZWVrID0gbnVsbFxuICAgICAgc3RlcHNCeVdlZWsgPSBbXVxuICAgICAgZm9yIHN0ZXAgaW4gc3RlcHNcbiAgICAgICAgd2VlayA9IG1vbWVudChzdGVwLnZhbHVlKS53ZWVrKClcbiAgICAgICAgaWYgbGFzdFdlZWsgIT0gd2Vla1xuICAgICAgICAgIHN0ZXBzQnlXZWVrLnB1c2ggW11cbiAgICAgICAgICBsYXN0V2VlayA9IHdlZWtcbiAgICAgICAgc3RlcHNCeVdlZWtbc3RlcHNCeVdlZWsubGVuZ3RoIC0gMV0ucHVzaCBzdGVwXG4gICAgICByZXR1cm4gc3RlcHNCeVdlZWtcblxuICAgIHNjb3BlLiR3YXRjaCgnY3VycmVudFZpZXcgKyBkYXRlICsgbWluRGF0ZSArIG1heERhdGUgKyBjdXJyZW50VmlldycsIC0+XG4gICAgICAjIEdldCB0aGUgc3RhcnRpbmcgZGF0ZS5cbiAgICAgIHN0ZXAgPSBzdGVwc1tzY29wZS5jdXJyZW50Vmlld11cbiAgICAgIHN0ZXBEYXRlID0gc3RlcC5maXJzdChtb21lbnQoc2NvcGUuZGF0ZSkpXG4gICAgICBwZXJpb2QgPSBzdGVwLnN0ZXBcbiAgICAgIGFtb3VudCA9IHN0ZXAuYW1vdW50XG5cbiAgICAgIGxvd2VyRGF0ZSA9IG1vbWVudChzY29wZS5kYXRlKS5zdGFydE9mKHNjb3BlLmN1cnJlbnRWaWV3KVxuICAgICAgdXBwZXJEYXRlID0gbW9tZW50KHNjb3BlLmRhdGUpLmFkZCgxLCBzY29wZS5jdXJyZW50VmlldylcblxuICAgICAgc2NvcGUuc3RlcHMgPSBmb3IgaSBpbiBbMS4uYW1vdW50XVxuXG4gICAgICAgIGJlZm9yZSA9IGlmIHNjb3BlLm1pbkRhdGU/IHRoZW4gc3RlcERhdGUuaXNCZWZvcmUoc2NvcGUubWluRGF0ZSwgc2NvcGUuY3VycmVudFZpZXcpIGVsc2UgdHJ1ZVxuICAgICAgICBhZnRlciA9IGlmIHNjb3BlLm1heERhdGU/IHRoZW4gc3RlcERhdGUuaXNBZnRlcihzY29wZS5tYXhEYXRlLCBzY29wZS5jdXJyZW50VmlldykgZWxzZSB0cnVlXG4gICAgICAgIHNhbWUgPSBzdGVwRGF0ZS5pc1NhbWUoc2NvcGUuZGF0ZSwgc2NvcGUuY3VycmVudFZpZXcpXG4gICAgICAgIG5ld0RhdGUgPSB7XG4gICAgICAgICAgc2VsZWN0YWJsZTogbm90IChiZWZvcmUgYW5kIGFmdGVyKVxuICAgICAgICAgIGFjdGl2ZTogc2FtZSAjXG4gICAgICAgICAgcGFzdDogc3RlcERhdGUuaXNCZWZvcmUobG93ZXJEYXRlKVxuICAgICAgICAgIGZ1dHVyZTogc3RlcERhdGUuaXNCZWZvcmUodXBwZXJEYXRlKVxuXG4gICAgICAgICAgZm9ybWF0dGVkOiBzdGVwRGF0ZS5mb3JtYXQoc3RlcC5mb3JtYXQpXG4gICAgICAgICAgdmFsdWU6IHN0ZXBEYXRlLnRvRGF0ZSgpXG4gICAgICAgIH1cbiAgICAgICAgc3RlcERhdGUgPSBtb21lbnQoc3RlcERhdGUpLmFkZChwZXJpb2QpXG4gICAgICAgIG5ld0RhdGVcblxuICAgICAgc2NvcGUuc3RlcHNCeVdlZWsgPSBzcGxpdEJ5V2Vla3Moc2NvcGUuc3RlcHMpXG5cbiAgICAgIHNjb3BlLiRjYW5OZXh0ID0gY2FuTmV4dFZpZXcoKVxuICAgICAgc2NvcGUuJGNhblByZXZpb3VzID0gY2FuUHJldmlvdXNWaWV3KClcbiAgICApXG5cbiAgICAjXG4gICAgIyBDb21wdXRlIGEgYm9vbGVhbiB2YWx1ZSB0aGF0IGluZGljYXRlIGlmXG4gICAgIyBzd2l0Y2hpbmcgdG8gdGhlIG5leHQgdmlldyB3b3VsZCBwdXQgdGhlXG4gICAgIyBjdXJzb3Igb24gYSBkYXRlIGFmdGVyIG1heERhdGUuXG4gICAgI1xuICAgICMgUmV0dXJucyB0cnVlIGlmIG1heERhdGUgaXMgbm90IGRlZmluZWQuXG4gICAgI1xuICAgIGNhbk5leHRWaWV3ID0gLT5cbiAgICAgIGlmIG5vdCBzY29wZS5tYXhEYXRlP1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gbW9tZW50KHNjb3BlLmRhdGUpLmFkZChzdGVwc1tzY29wZS5jdXJyZW50Vmlld10ubmV4dCkuaXNCZWZvcmUoc2NvcGUubWF4RGF0ZSlcblxuICAgICNcbiAgICAjIENvbXB1dGUgYSBib29sZWFuIHZhbHVlIHRoYXQgaW5kaWNhdGUgaWZcbiAgICAjIHN3aXRjaGluZyB0byB0aGUgcHJldmlvdXMgdmlldyB3b3VsZCBwdXQgdGhlXG4gICAgIyBjdXJzb3Igb24gYSBkYXRlIGJlZm9yZSBtaW5EYXRlLlxuICAgICNcbiAgICAjIFJldHVybnMgdHJ1ZSBpZiBtaW5EYXRlIGlzIG5vdCBkZWZpbmVkLlxuICAgICNcbiAgICBjYW5QcmV2aW91c1ZpZXcgPSAtPlxuICAgICAgaWYgbm90IHNjb3BlLm1pbkRhdGU/XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBtb21lbnQoc2NvcGUuZGF0ZSkuYWRkKHN0ZXBzW3Njb3BlLmN1cnJlbnRWaWV3XS5wcmV2aW91cykuaXNBZnRlcihzY29wZS5taW5EYXRlKVxuXG4gICAgI1xuICAgICMgUmV0dXJuIHRoZSBuZXh0IHZpZXcgdmFsdWUuXG4gICAgI1xuICAgIG5leHRWaWV3VmFsdWUgPSAodmlldykgLT5cbiAgICAgIGluZGV4ID0gdmlld3MuaW5kZXhPZih2aWV3KVxuICAgICAgaWYgaW5kZXggPT0gLTFcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHZpZXcgXFxcIlwiICsgdmlldyArIFwiXFxcIiBpcyBpbnZhbGlkXCIpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIGluZGV4KysgPCB2aWV3cy5sZW5ndGhcbiAgICAgICAgICB2aWV3c1tpbmRleF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZpZXdzWy0xLi5dXG5cbiAgICBzY29wZS5uZXh0VmlldyA9IChldmVudCkgLT5cbiAgICAgIGlmIGV2ZW50P1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIHNjb3BlLnN3aXRjaFZpZXcoXG4gICAgICAgIG5leHRWaWV3VmFsdWUoXG4gICAgICAgICAgc2NvcGUuY3VycmVudFZpZXdcbiAgICAgICAgKVxuICAgICAgKVxuXG4gICAgI1xuICAgICMgUmV0dXJuIHRoZSBuZXh0IHZpZXcgdmFsdWUuXG4gICAgI1xuICAgIHByZXZpb3VzVmlld1ZhbHVlID0gKHZpZXcpIC0+XG4gICAgICBpbmRleCA9IHZpZXdzLmluZGV4T2YodmlldylcbiAgICAgIGlmIGluZGV4ID09IC0xXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSB2aWV3IFxcXCJcIiArIHZpZXcgKyBcIlxcXCIgaXMgaW52YWxpZFwiKVxuICAgICAgZWxzZVxuICAgICAgICBpZiBpbmRleC0tID4gMFxuICAgICAgICAgIHZpZXdzW2luZGV4XVxuICAgICAgICBlbHNlXG4gICAgICAgICAgdmlld3NbMF1cblxuICAgICMgVE9ETzogUmVuYW1lIHRvIHZpZXdQcmV2aW91c1xuICAgIHNjb3BlLnByZXZpb3VzVmlldyA9IChldmVudCkgLT5cbiAgICAgIGlmIGV2ZW50P1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIHNjb3BlLnN3aXRjaFZpZXcoXG4gICAgICAgIHByZXZpb3VzVmlld1ZhbHVlKFxuICAgICAgICAgIHNjb3BlLmN1cnJlbnRWaWV3XG4gICAgICAgIClcbiAgICAgIClcblxuICAgIHNjb3BlLnN3aXRjaFZpZXcgPSAodmlldywgZXZlbnQpLT5cbiAgICAgIGlmIGV2ZW50P1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIHNjb3BlLmN1cnJlbnRWaWV3ID0gdmlld1xuXG4gIHJlc3RyaWN0OiAnRSdcbiAgdGVtcGxhdGU6IFwiXCJcIlxuPGRpdiB0YWJpbmRleD1cIjBcIiBuZy1rZXlkb3duPVwia2V5UHJlc3MoJGV2ZW50KVwiIGNsYXNzPVwiZGF0ZXRpbWVwaWNrZXIgdGFibGUtcmVzcG9uc2l2ZVwiPlxuPHRhYmxlICBjbGFzcz1cInRhYmxlIHRhYmxlLXN0cmlwZWQgIHt7IGN1cnJlbnRWaWV3IH19LXZpZXdcIj5cbiAgIDx0aGVhZD5cbiAgICAgICA8dHI+XG4gICAgICAgICAgIDx0aCBjbGFzcz1cImxlZnRcIiBkYXRhLW5nLWNsaWNrPVwicHJldmlvdXMoJGV2ZW50KVwiIGRhdGEtbmctc2hvdz1cIiRjYW5QcmV2aW91c1wiPjxpIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1hcnJvdy1sZWZ0XCIvPjwvdGg+XG4gICAgICAgICAgIDx0aCBjbGFzcz1cInN3aXRjaFwiIGNvbHNwYW49XCI1XCIgZGF0YS1uZy1jbGljaz1cInByZXZpb3VzVmlldygkZXZlbnQpXCI+XG4gICAgICAgICAgICAgICA8c3BhbiBuZy1yZXBlYXQ9XCJ0b2tlbiBpbiB0b2tlbnNcIiBjbGFzcz1cInt7IHRva2VuLnZpZXcgfX0ge3sgdG9rZW4udmlldyA9PT0gY3VycmVudFZpZXcgJiYgJ2N1cnJlbnQnIHx8ICcnIH19IFwiID5cbiAgICAgICAgICAgICAgICAgPGEgbmctaWY9XCJ0b2tlbi52aWV3XCIgbmctY2xpY2s9XCJzd2l0Y2hWaWV3KHRva2VuLnZpZXcsICRldmVudClcIj57eyBkYXRlLnRvRGF0ZSgpIHwgZGF0ZTp0b2tlbi5mb3JtYXQgfX08L2E+XG4gICAgICAgICAgICAgICAgIDxzcGFuIG5nLWlmPVwiIXRva2VuLnZpZXdcIj57eyB0b2tlbi52YWx1ZSB9fTwvc3Bhbj5cbiAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgPC90aD5cbiAgICAgICAgICAgPHRoIGNsYXNzPVwicmlnaHRcIiBkYXRhLW5nLWNsaWNrPVwibmV4dCgkZXZlbnQpXCIgZGF0YS1uZy1zaG93PVwiJGNhbk5leHRcIj48aSBjbGFzcz1cImdseXBoaWNvbiBnbHlwaGljb24tYXJyb3ctcmlnaHRcIi8+PC90aD5cbiAgICAgICA8L3RyPlxuICAgICAgIDx0ciBkYXRhLW5nLXNob3c9XCJjdXJyZW50VmlldyA9PT0gJ2RheVwiPlxuICAgICAgICAgICA8dGggY2xhc3M9XCJkb3dcIiBkYXRhLW5nLXJlcGVhdD1cImRheSBpbiBkb3dcIiA+e3sgZGF5IH19PC90aD5cbiAgICAgICA8L3RyPlxuICAgPC90aGVhZD5cbiAgIDx0Ym9keT5cbiAgICAgICA8dHIgZGF0YS1uZy1pZj1cImN1cnJlbnRWaWV3ICE9PSAnZGF5J1wiID5cbiAgICAgICAgICAgPHRkIGNvbHNwYW49XCI3XCIgPlxuICAgICAgICAgICAgICA8c3BhbiAgICBjbGFzcz1cInt7IGN1cnJlbnRWaWV3IH19XCJcbiAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1uZy1yZXBlYXQ9XCJzdGVwIGluIHN0ZXBzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1uZy1jbGFzcz1cInthY3RpdmU6IHN0ZXAuYWN0aXZlLCBwYXN0OiBzdGVwLnBhc3QsIGZ1dHVyZTogc3RlcC5mdXR1cmUsIGRpc2FibGVkOiAhc3RlcC5zZWxlY3RhYmxlfVwiXG4gICAgICAgICAgICAgICAgICAgICAgIGRhdGEtbmctY2xpY2s9XCJzZWxlY3REYXRlKHN0ZXAsJGV2ZW50KVwiPnt7IHN0ZXAuZm9ybWF0dGVkIH19PC9zcGFuPlxuICAgICAgICAgICA8L3RkPlxuICAgICAgIDwvdHI+XG4gICAgICAgPHRyIGRhdGEtbmctaWY9XCJjdXJyZW50VmlldyA9PT0gJ2RheSdcIiBkYXRhLW5nLXJlcGVhdD1cIndlZWsgaW4gc3RlcHNCeVdlZWtcIj5cbiAgICAgICAgICAgPHRkIGRhdGEtbmctcmVwZWF0PVwic3RlcCBpbiB3ZWVrXCJcbiAgICAgICAgICAgICAgIGRhdGEtbmctY2xpY2s9XCJzZWxlY3REYXRlKHN0ZXAsJGV2ZW50KVwiXG4gICAgICAgICAgICAgICBjbGFzcz1cImRheVwiXG4gICAgICAgICAgICAgZGF0YS1uZy1jbGFzcz1cInthY3RpdmU6IHN0ZXAuYWN0aXZlLCBwYXN0OiBzdGVwLnBhc3QsIGZ1dHVyZTogc3RlcC5mdXR1cmUsIGRpc2FibGVkOiAhc3RlcC5zZWxlY3RhYmxlfVwiPnt7IHN0ZXAuZm9ybWF0dGVkIH19PC90ZD5cbiAgICAgICA8L3RyPlxuICAgPC90Ym9keT5cbjwvdGFibGU+XG48L2Rpdj5cblwiXCJcIlxuXG5cbiAgfVxuXVxuIl19