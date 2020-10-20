import React, { useState } from 'react';
import moment from 'moment';
import cn from 'classnames';
import { DateRangePicker as ReactDateRangePicker } from 'react-date-range';
import PropTypes from 'prop-types';

import ArrowNext from 'assets/images/long-arrow-next.svg';
import styles from './style.scss';

import DateInput from './DateInput';
import {
  useComponentVisible, createStaticRanges, isSameDay, isAfterDay, isBeforeDay,
} from './helpers';

function DateRangePicker(props) {
  const {
    readOnly,
    startDatePlaceholder,
    endDatePlaceholder,
    disabled,
    range,
    onChange,
  } = props;

  const [rangeString, setRangeString] = useState(
    {
      startDateString: '',
      endDateString: '',
    },
  );

  const [focusedRange, setFocusedRange] = useState([0, 0]);

  const {
    ref: calendarRef,
    isComponentVisible,
    setIsComponentVisible,
  } = useComponentVisible(false);

  const onEndDateChange = (e) => {
    const endDateString = e.target.value;
    const endDate = moment(endDateString, 'MM/DD/YYYY', true);
    if (endDate.isValid()) {
      onChange({
        endDate: endDate.toDate(),
        startDate: range.startDate,
      });

      setRangeString({
        ...rangeString,
        endDateString: endDate.format('MM/DD/YYYY'),
      });
    } else {
      setRangeString({
        ...rangeString,
        endDateString,
      });
    }
  };

  const onStartDateChange = (e) => {
    const startDateString = e.target.value;
    const startDate = moment(startDateString, 'MM/DD/YYYY', true);
    if (startDate.isValid()) {
      onChange({
        endDate: range.endDate,
        startDate: startDate.toDate(),
      });

      setRangeString({
        ...rangeString,
        startDateString: startDate.format('MM/DD/YYYY'),
      });
    } else {
      setRangeString({
        ...rangeString,
        startDateString,
      });
    }
  };

  const onIconClickStartDate = () => {
    setFocusedRange([0, 0]);
    setIsComponentVisible(true);
  };

  const onIconClickEndDate = () => {
    if (rangeString.startDateString) {
      setFocusedRange([0, 1]);
      setIsComponentVisible(true);
    }
  };

  const isEndDateDisabled = () => disabled || !range.startDate;

  const onDateRangePickerChange = (item) => {
    const isStartDateFocused = focusedRange[1] === 0;
    const isEndDateFocused = focusedRange[1] === 1;

    let shouldCloseCalendar = false;

    const payload = {
      ...item.selection,
    };

    const payloadString = {
      endDateString: undefined,
      startDateString: undefined,
    };

    if (isStartDateFocused && isSameDay(payload.startDate, payload.endDate)) {
      if (isAfterDay(payload.startDate, range.endDate) || !range.endDate) {
        payload.endDate = payload.startDate;
        payloadString.endDateString = '';
      } else {
        payload.endDate = range.endDate;
      }
    } else if (isEndDateFocused) {
      if (
        isBeforeDay(payload.startDate, range.startDate)
        && isSameDay(payload.endDate, range.startDate)) {
        payload.endDate = null;
        payload.startDate = null;
      } else {
        shouldCloseCalendar = true;
      }
    } else {
      // Changes From Defined Selection (Past Week, Past Month, etc)
      shouldCloseCalendar = true;
    }


    payloadString.startDateString = payload.startDate ? moment(payload.startDate).format('MM/DD/YYYY') : '';
    if (payloadString.endDateString === undefined) {
      payloadString.endDateString = payload.endDate ? moment(payload.endDate).format('MM/DD/YYYY') : '';
    }

    onChange({
      startDate: payload.startDate,
      endDate: payload.endDate ? moment(payload.endDate).endOf('day').toDate() : null,
    });
    setRangeString(payloadString);

    if (shouldCloseCalendar) {
      setIsComponentVisible(false);
    }
  };

  const getShownDate = () => {
    const isStartDateFocused = focusedRange[1] === 0;

    if (isStartDateFocused) {
      return range.startDate || moment().toDate();
    }
    // isEndDateFocused
    return range.endDate || moment().toDate();
  };

  return (
    <div>
      <div styleName="dateInputWrapper">
        {/* eslint-disable-next-line */}
        <label styleName="inputLabel" htmlFor="input-date-range">Date range</label>
        <DateInput
          isFocused={focusedRange[1] === 0 && isComponentVisible}
          disabled={disabled}
          readOnly={readOnly}
          value={rangeString.startDateString}
          placeholder={startDatePlaceholder}
          maskChar={null}
          onChange={onStartDateChange}
          onFocus={() => setFocusedRange([0, 0])}
          onIconClick={onIconClickStartDate}
        />
        <ArrowNext styleName="arrow" />
        <DateInput
          isFocused={focusedRange[1] === 1 && isComponentVisible}
          disabled={isEndDateDisabled()}
          label="You must input start date first"
          readOnly={readOnly}
          value={rangeString.endDateString}
          placeholder={endDatePlaceholder}
          maskChar={null}
          onChange={onEndDateChange}
          onFocus={() => setFocusedRange([0, 1])}
          onIconClick={onIconClickEndDate}
        />
      </div>

      <div
        className={cn([
          styles.calendarWrapper,
          focusedRange[1] === 1 && styles.endDate,
          (!range.startDate && !range.endDate) && styles.empty,
        ])}
        ref={calendarRef}
      >
        {
          isComponentVisible && (
            <ReactDateRangePicker
              focusedRange={focusedRange}
              onRangeFocusChange={setFocusedRange}
              onChange={onDateRangePickerChange}
              dateDisplayFormat="MM/dd/yyyy"
              rangeColors={['#10B88A']}
              showDateDisplay={false}
              staticRanges={createStaticRanges()}
              inputRanges={[]}
              moveRangeOnFirstSelection={false}
              initialFocusedRange={[0, 1]}
              showMonthArrow={false}
              ranges={[{
                ...range,
                key: 'selection',
              }]}
              shownDate={getShownDate()}
            />
          )
        }
      </div>
    </div>
  );
}

DateRangePicker.propTypes = {
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  startDatePlaceholder: PropTypes.string,
  endDatePlaceholder: PropTypes.string,
  range: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

DateRangePicker.defaultProps = {
  readOnly: false,
  disabled: false,
  startDatePlaceholder: 'Start Date',
  endDatePlaceholder: 'End Date',
};

export default DateRangePicker;
