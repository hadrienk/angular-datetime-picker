###
    angular-moment-datetimepicker

    A highly extensible date time picker directive.
###
module = angular.module 'ui.bootstrap.moment.datetimepicker', []
#
# Contain default parameters for the directive
#
module.constant 'dateTimePickerConfig', {
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
}

#
# moment datetimepicker directive.
#
module.directive 'momentDatetimepicker', ['dateTimePickerConfig', (defaultConfig)->
  return {
  scope: {
    minDate: '=?'     # minimum selectionable date.
    maxDate: '=?'     # maximum selectionable date.
    view: '=?'
    tokens: '&'
    position: '=?'    # Default to ng-model.
    selected: '=?'    # Hold the selection until commit.
    hovered: '=?'
    activeBefore: '=?'
    activeAfter: '=?'
  }
  replace: true
  link: (scope, elm, attr)->
    scope.view = 'year' if not scope.view?

    #
    # Used to calculate the next values
    #
    steps = defaultConfig

    # This should be calculated D. M YYYY
    scope.tokens = if not scope.tokens()? then [
      {format: 'd', view: 'day'}
      {format: '. '}
      {format: 'MMMM', view: 'month'}
      {format: ' '}
      {format: 'yyyy', view: 'year'}
    ] else scope.tokens()

    #
    # Helper functions returning the durations
    # required to move with the keyboard.
    #
    goLeft = ->
      -steps[scope.view].step
    goRight = ->
      steps[scope.view].step
    goDown = ->
      steps[scope.view].line
    goUp = ->
      -steps[scope.view].line

    scope.keyPress = ($event) ->

      selected = moment(scope.selected)

      switch $event.keyCode
        when 39 then scope.select(selected.add(goRight()), $event)
        when 40 then scope.select(selected.add(goDown()), $event)
        when 37 then scope.select(selected.add(goLeft()), $event)
        when 38 then scope.select(selected.add(goUp()), $event)
        when 13 then scope.nextView($event) # enter
        when 8 then scope.previousView($event) # backspace
        when 9 then angular.noop #tab
        when 27 then angular.noop # esc


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

    scope.dow = moment.weekdaysShort()

    scope.hover = (date, event) ->
      if event?
        event.stopPropagation()
        event.preventDefault()

      scope.hovered = if date.value? then moment(date.value).toDate() else moment(date).toDate()

    #
    # Set selected to the value of the date argument.
    #
    scope.select = (date, event) ->
      if event?
        event.stopPropagation()
        event.preventDefault()

      scope.selected = if date.value? then moment(date.value).toDate() else moment(date).toDate()


    #
    # Change to the next position
    #
    scope.next = (event) ->
      if event?
        event.stopPropagation()
        event.preventDefault()

      date = moment(scope.selected)
      offset = steps[scope.view].next
      date.add(offset)
      scope.position = date.toDate()

    #
    # Change to the previous position
    #
    scope.previous = (event) ->
      if event?
        event.stopPropagation()
        event.preventDefault()

      date = moment(scope.selected)
      offset = steps[scope.view].previous
      date.add(offset)
      scope.position = date.toDate()


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

    scope.$watch('activeBefore + activeAfter + view + position', ->
      # need to update the steps.
      return if not scope.steps? or not (scope.activeBefore? or scope.activeAfter?)

      for step in scope.steps
        date = moment(step.value)
        isBefore = if scope.activeBefore? then date.isBefore(scope.activeBefore) else true
        isAfter = if scope.activeAfter? then date.isAfter(scope.activeAfter) else true
        step.active = isBefore and isAfter
    )

    scope.$watch('view + position + minDate + maxDate + selected', ->
      # Get the starting date.
      step = steps[scope.view]
      stepDate = step.first(moment(scope.position))
      period = step.step
      amount = step.amount

      lowerDate = moment(scope.position).startOf(scope.view)
      upperDate = moment(scope.position).add(1, scope.view)
      currentDate = moment(scope.selected)

      scope.steps = for i in [1..amount]

        # TODO: Use the step to make the comparison!
        before = if scope.minDate? then stepDate.isBefore(scope.minDate, scope.view) else true
        after = if scope.maxDate? then stepDate.isAfter(scope.maxDate, scope.view) else true
        same = stepDate.isSame(currentDate, scope.view)
        newDate = {
          selectable: not (before and after)
          active: same #
          past: stepDate.isBefore(lowerDate)
          future: stepDate.isBefore(upperDate)

          formatted: stepDate.format(step.format)
          value: stepDate.toDate()
        }
        stepDate = moment(stepDate).add(period)
        newDate # Important!

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
        return moment(scope.selected).add(steps[scope.view].next).isBefore(scope.maxDate)

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
        return moment(scope.selected).add(steps[scope.view].previous).isAfter(scope.minDate)

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
          scope.view
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
          scope.view
        )
      )

    scope.switchView = (view, event)->
      if event?
        event.stopPropagation()
        event.preventDefault()

      scope.view = view

  restrict: 'E'
  template: """
<div tabindex="0" ng-keydown="keyPress($event)" class="datetimepicker table-responsive">
<table  class="table table-striped  {{ view }}-view">
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
                       data-ng-mouseover="hover(step,$event)">{{ step.formatted }}</span>
           </td>
       </tr>
       <tr data-ng-if="view === 'day'" data-ng-repeat="week in stepsByWeek">
           <td data-ng-repeat="step in week"
               data-ng-click="select(step,$event)"
               data-ng-mouseover="hover(step,$event)"
               class="day"
             data-ng-class="{active: step.active, past: step.past, future: step.future, disabled: !step.selectable}">{{ step.formatted }}</td>
       </tr>
   </tbody>
</table>
</div>
"""


  }
]
