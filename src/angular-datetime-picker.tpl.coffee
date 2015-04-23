"use strict"

angular.module('datetime.picker').run(['$templateCache', (cache)->
  cache.put('datetime/picker.tpl.html', """
<div ng-keydown="keyPress($event)" class="datetimepicker table-responsive">
  <table  class="table {{ view }}-view">
     <thead>
         <tr>
             <th class="left" data-ng-click="previous($event)" data-ng-show="$canPrevious"><i class="glyphicon glyphicon-arrow-left"/></th>
             <th class="switch" colspan="5" data-ng-click="previousView($event)">
                 <span ng-repeat="token in tokens" class="{{ token.view }} {{ token.view === view && 'current' || '' }} " >
                   <a ng-if="token.view" ng-click="switchView(token.view, $event)">{{ position | date:token.format }}</a>
                   <span ng-if="!token.view">{{ token.value }}</span>
                 </span>
             </th>
             <th class="right" data-ng-click="next($event)" data-ng-show="$canNext"><i class="glyphicon glyphicon-arrow-right"/></th>
         </tr>
         <tr data-ng-show="view === 'day'">
             <th class="dow" data-ng-repeat="day in dow" >{{ day }}</th>
         </tr>
     </thead>
     <tbody>
         <tr data-ng-if="view !== 'day'" >
             <td colspan="7" >
                <span    class="{{ view }}"
                         data-ng-repeat="step in steps"
                         data-ng-class="{active: step.active, past: step.past, future: step.future, disabled: !step.selectable}"
                         data-ng-click="select(step,$event)"
                         data-ng-mouseenter="hover(step,$event)">{{ step.formatted }}</span>
             </td>
         </tr>
         <tr data-ng-if="view === 'day'" data-ng-repeat="weeks in byWeeks">
             <td data-ng-repeat="step in weeks"
                 data-ng-click="select(step,$event)"
                 data-ng-mouseenter="hover(step,$event)"
                 class="day"
               data-ng-class="{active: step.active, past: step.past, future: step.future, disabled: !step.selectable}">{{ step.formatted }}</td>
         </tr>
     </tbody>
  </table>
</div>
""")
  cache.put('datetime/period-picker.tpl.html', """
<div class='period-picker'>
  <div class="previous-btn" ng-click="$previous()">
    <a>previous</a>
  </div>
  <div class="pickers">
    <div class='picker left'>
      <moment-datetimepicker selected="left"
                             position="leftPos"
                             view="view"
                             active-before="lab"
                             active-after="laa"
                             hovered="hover"
                             min-date="min"
                             max-date="max">
      </moment-datetimepicker>
    </div>
    <div class='picker middle'>
      <moment-datetimepicker selected="right"
                             position="middlePos"
                             view="view"
                             active-before="rab"
                             active-after="raa"
                             hovered="hover"
                             min-date="min"
                             max-date="max">
    </div>
    <div class='picker right'>
      <moment-datetimepicker selected="middle"
                             position="rightPos"
                             view="view"
                             active-before="mab"
                             active-after="maa"
                             hovered="hover"
                             min-date="min"
                             max-date="max">
      </moment-datetimepicker>
    </div>
  </div>
  <div class="next-btn" ng-click="$next()">
    <a>next</a>
  </div>
</div>
""")
])
