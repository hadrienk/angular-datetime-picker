###
    angular-moment-datetimepicker

    A highly extensible date time picker directive.
###
module = angular.module 'ui.bootstrap.moment.datetimepicker', []

#
# Contain default parameters for the directive
#
module.constant('dateTimePickerConfig', {
  year:
    format: 'YYYY'
    first: (date) ->
      date.year(parseInt(date.year() / 10, 10) * 10)
    amount: 12
    line: moment.duration(4, 'year')
    step: moment.duration(1, 'year')
    previous: moment.duration(-10, 'year')
    next: moment.duration(10, 'year')
  month:
    format: 'MMM YY'
    first: (date) ->
      date.month(0)
    amount: 12
    line: moment.duration(4, 'month')
    step: moment.duration(1, 'month')
    previous: moment.duration(-1, 'year')
    next: moment.duration(1, 'year')
  day:
    format: 'D'
    first: (date) ->
      date.date(1)
      date.subtract(Math.abs(date.weekday()), 'days')
    amount: 42
    line: moment.duration(7, 'day')
    step: moment.duration(1, 'day')
    previous: moment.duration(-1, 'month')
    next: moment.duration(1, 'month')
  hour:
    format: 'hh:mm'
    first: (date) ->
      date.hours(0).minutes(0)
    amount: 24
    line: moment.duration(4, 'hour')
    step: moment.duration(1, 'hour')
    previous: moment.duration(-1, 'day')
    next: moment.duration(1, 'day')
  minute:
    format: 'hh:mm'
    first: (date) ->
      date.hours(0).minutes(0)
    amount: 24
    line: moment.duration(2, 'hour')
    step: moment.duration(15, 'minute')
    previous: moment.duration(-1, 'hour')
    next: moment.duration(1, 'hour')
  second:
    format: 'hh:mm:ss'
    first: (date) ->
      date.hours(0).minutes(0).seconds(parseInt(date.seconds() / 15, 10) * 15)
    amount: 4 * 3
    line: moment.duration(20, 'second')
    step: moment.duration(5, 'second')
    previous: moment.duration(-1, 'hour')
    next: moment.duration(1, 'hour')
})

#
# moment datetimepicker directive.
#
module.directive 'momentDatetimepicker', ->
  return {
  scope: {
    mdFormat: '&'     # moment format string use to format the current date.
    minDate: '=?'     # minimum selectionable date.
    maxDate: '=?'     # maximum selectionable date.
    currentView: '=?' #
    commitView: '&'   #
    afterSelect: '&'
  }
  require: 'ngModel'
  replace: true
  link: (scope, elm, attr, ngModel)->
    scope.currentView = if scope.currentView? then 'year'
    console.log scope


    #
    # Helper functions returning the durations
    # required to move with the keyboard.
    #
    goLeft = ->
      -steps[scope.currentView].step
    goRight = ->
      steps[scope.currentView].step
    goDown = ->
      steps[scope.currentView].line
    goUp = ->
      -steps[scope.currentView].line

    scope.keyPress = ($event) ->
      switch $event.keyCode
        when 39 then scope.selectDate(scope.date.add(goRight()), $event)
        when 40 then scope.selectDate(scope.date.add(goDown()), $event)
        when 37 then scope.selectDate(scope.date.add(goLeft()), $event)
        when 38 then scope.selectDate(scope.date.add(goUp()), $event)
        when 13 then scope.nextView($event) # enter
        when 8 then scope.previousView($event) # backspace
        when 9 then angular.noop #tab
        when 27 then angular.noop # esc

    #ngModel.$setViewValue(newValue);
    ngModel.$render = ->
      scope.date = moment(ngModel.$modelValue) || moment()

    views = [
      'year', 'month', 'day'
      'hour', 'minute', 'second'
    ]

    afterSelect = angular.noop

    onSelectDisabled = (step, $event) ->
      console.log "Clicked on a disabled date."

    onSelectFuture = (step, $event) ->
      console.log "Clicked on a future date."

    onSelectPast = (step, $event) ->
      console.log "Clicked on a past date."

    onSelectUnselectable = (step, $event) ->
      console.log "Clicked on a date outside the range"

    # Should observe on
    # date value.
    # min
    # max
    # format
    # config
    # locale

    views = [
      'year', 'month', 'day',
      'hour', 'minute', 'second'
    ]

    #
    # Used to calculate the next values
    #
    steps =

      scope.dow = moment.weekdaysShort()

    scope.selectDate = (date, event) ->
      if event?
        event.stopPropagation()
        event.preventDefault()


      date = if date.value? then moment(date.value) else moment(date)
      #ngModel.$setViewValue(date.toDate());
      scope.date = date

      afterSelect(scope) if event?

    scope.setDate = (date) ->
      scope.date = date

    scope.next = (event) ->
      if event?
        event.stopPropagation()
        event.preventDefault()

      date = moment(scope.date)
      offset = steps[scope.currentView].next
      date.add(offset)
      scope.setDate(date)

    scope.previous = (event) ->
      if event?
        event.stopPropagation()
        event.preventDefault()

      date = moment(scope.date)
      offset = steps[scope.currentView].previous
      date.add(offset)
      scope.setDate(date)

    scope.currentView = 'month'

    # This should be calculated D. M YYYY
    scope.tokens = [
      {format: 'd', view: 'day'}
      {format: '. '}
      {format: 'MMMM', view: 'month'}
      {format: ' '}
      {format: 'yyyy', view: 'year'}
    ]

    ###
      Helper method that split the steps by week
    ###
    splitByWeeks = (steps = []) ->
      lastWeek = null
      stepsByWeek = []
      for step in steps
        week = moment(step.value).week()
        if lastWeek != week
          stepsByWeek.push []
          lastWeek = week
        stepsByWeek[stepsByWeek.length - 1].push step
      return stepsByWeek

    scope.$watch('currentView + date + minDate + maxDate + currentView', ->
      # Get the starting date.
      step = steps[scope.currentView]
      stepDate = step.first(moment(scope.date))
      period = step.step
      amount = step.amount

      lowerDate = moment(scope.date).startOf(scope.currentView)
      upperDate = moment(scope.date).add(1, scope.currentView)

      scope.steps = for i in [1..amount]

        before = if scope.minDate? then stepDate.isBefore(scope.minDate, scope.currentView) else true
        after = if scope.maxDate? then stepDate.isAfter(scope.maxDate, scope.currentView) else true
        same = stepDate.isSame(scope.date, scope.currentView)
        newDate = {
          selectable: not (before and after)
          active: same #
          past: stepDate.isBefore(lowerDate)
          future: stepDate.isBefore(upperDate)

          formatted: stepDate.format(step.format)
          value: stepDate.toDate()
        }
        stepDate = moment(stepDate).add(period)
        newDate

      scope.stepsByWeek = splitByWeeks(scope.steps)

      scope.$canNext = canNextView()
      scope.$canPrevious = canPreviousView()
    )

    #
    # Compute a boolean value that indicate if
    # switching to the next view would put the
    # cursor on a date after maxDate.
    #
    # Returns true if maxDate is not defined.
    #
    canNextView = ->
      if not scope.maxDate?
        return true
      else
        return moment(scope.date).add(steps[scope.currentView].next).isBefore(scope.maxDate)

    #
    # Compute a boolean value that indicate if
    # switching to the previous view would put the
    # cursor on a date before minDate.
    #
    # Returns true if minDate is not defined.
    #
    canPreviousView = ->
      if not scope.minDate?
        return true
      else
        return moment(scope.date).add(steps[scope.currentView].previous).isAfter(scope.minDate)

    #
    # Return the next view value.
    #
    nextViewValue = (view) ->
      index = views.indexOf(view)
      if index == -1
        throw new Error("The view \"" + view + "\" is invalid")
      else
        if index++ < views.length
          views[index]
        else
          views[-1..]

    scope.nextView = (event) ->
      if event?
        event.stopPropagation()
        event.preventDefault()

      scope.switchView(
        nextViewValue(
          scope.currentView
        )
      )

    #
    # Return the next view value.
    #
    previousViewValue = (view) ->
      index = views.indexOf(view)
      if index == -1
        throw new Error("The view \"" + view + "\" is invalid")
      else
        if index-- > 0
          views[index]
        else
          views[0]

    # TODO: Rename to viewPrevious
    scope.previousView = (event) ->
      if event?
        event.stopPropagation()
        event.preventDefault()

      scope.switchView(
        previousViewValue(
          scope.currentView
        )
      )

    scope.switchView = (view, event)->
      if event?
        event.stopPropagation()
        event.preventDefault()

      scope.currentView = view

  restrict: 'E'
  template: """
<div tabindex="0" ng-keydown="keyPress($event)" class="datetimepicker table-responsive">
<table  class="table table-striped  {{ currentView }}-view">
   <thead>
       <tr>
           <th class="left" data-ng-click="previous($event)" data-ng-show="$canPrevious"><i class="glyphicon glyphicon-arrow-left"/></th>
           <th class="switch" colspan="5" data-ng-click="previousView($event)">
               <span ng-repeat="token in tokens" class="{{ token.view }} {{ token.view === currentView && \'current\' || \'\' }} " >
                 <a ng-if="token.view" ng-click="switchView(token.view, $event)">{{ date.toDate() | date:token.format }}</a>
                 <span ng-if="!token.view">{{ token.value }}</span>
               </span>
           </th>
           <th class="right" data-ng-click="next($event)" data-ng-show="$canNext"><i class="glyphicon glyphicon-arrow-right"/></th>
       </tr>
       <tr data-ng-show="currentView === 'day">
           <th class="dow" data-ng-repeat="day in dow" >{{ day }}</th>
       </tr>
   </thead>
   <tbody>
       <tr data-ng-if="currentView !== 'day'" >
           <td colspan="7" >
              <span    class="{{ currentView }}"
                       data-ng-repeat="step in steps"
                       data-ng-class="{active: step.active, past: step.past, future: step.future, disabled: !step.selectable}"
                       data-ng-click="selectDate(step,$event)">{{ step.formatted }}</span>
           </td>
       </tr>
       <tr data-ng-if="currentView === 'day'" data-ng-repeat="week in stepsByWeek">
           <td data-ng-repeat="step in week"
               data-ng-click="selectDate(step,$event)"
               class="day"
             data-ng-class="{active: step.active, past: step.past, future: step.future, disabled: !step.selectable}">{{ step.formatted }}</td>
       </tr>
   </tbody>
</table>
</div>
"""


  }

