// react
import { FC, useState } from 'react';

// mui
import { makeStyles, lighten } from '@material-ui/core/styles';
import {
  Typography,
  Divider,
  Grid,
  Card,
  CardHeader,
  CardContent,
  FormControlLabel,
  Switch,
} from '@material-ui/core';

import LocationOnIcon from '@material-ui/icons/LocationOn';
import PersonIcon from '@material-ui/icons/Person';

// devexpress
import {
  Scheduler,
  WeekView,
  MonthView,
  Appointments,
  DateNavigator,
  Toolbar,
  ViewSwitcher,
} from '@devexpress/dx-react-scheduler-material-ui';
import { ViewState } from '@devexpress/dx-react-scheduler';

// utils
import { Data, Calendar as CalendarType } from '../../utils/types';

// components
import DialogEventActions from './DialogEventActions';
import { useData } from '../../hooks/useData';

const useStyles = makeStyles((theme) => ({
  item: (props: any) => ({
    borderRightStyle: "solid",
    borderRightWidth: theme.spacing(0.7),
    borderRightColor: props.secondaryColor,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  }),
  header: (props: any) => ({
    padding: theme.spacing(0.5),
    backgroundColor: props.primaryColor,
  }),
  title: {
    fontSize: theme.spacing(2),
  },
  content: {
    fontSize: theme.spacing(1.5),
    padding: theme.spacing(0.5),
  },
  divider: {
    margin: theme.spacing(0.5),
  },
  toolbar: {
    padding: theme.spacing(0, 2),
    flex: 1,
  },
}));

interface CalendarItemProps {
  event: Data.Event
  withDialog: boolean
  view: CalendarType.View
  onClick?: (event: Data.Event) => void
  onEventStateChange?: (event: Data.Event) => void
  viewEvent?: (event: Data.Event) => void
  startDate: Date
  endDate: Date
}

const CalendarItem: FC<{ data: CalendarItemProps }> = (props) => {

  const { data } = useData();

  const statusLabel = data.config.labelsStatus.find(
    (label) => label.status === props.data.event.status
  ) as Data.LabelStatus;

  let secondary: string;

  if (props.data.event.labels.length > 0) {
    secondary = props.data.event.labels[0].color;
  } else {
    secondary = statusLabel.color;
  }

  const classes = useStyles({
    primaryColor: lighten(statusLabel.color, 0.3),
    secondaryColor: secondary,
  });

  const [open, setOpen] = useState(false);

  const onClick = () => {
    if (props.data.withDialog) {
      setOpen(true);
    } else if (props.data.onClick) {
      props.data.onClick(props.data.event);
    }
  }

  return (
    <>
      <a
        onClick={onClick}
        style={{ cursor: "pointer" }}
      >
        <Card className={classes.item}>
          <CardHeader
            className={classes.header}
            title={
              <Typography variant="h3" className={classes.title}>
                {props.data.event.client.name}
              </Typography>
            }
          />
          {props.data.view !== "Month" &&
            <CardContent className={classes.content}>
              <Grid container direction="row" justify="space-between" alignItems="center">
                <PersonIcon />
                <Typography component="span" variant="body2" color="textPrimary">
                  {props.data.event.people}
                </Typography>
              </Grid>
              <Divider className={classes.divider} />
              <Grid container direction="row" justify="space-between" alignItems="center">
                <LocationOnIcon />
                <Typography component="span" variant="body2" color="textPrimary">
                  {props.data.event.address.town}
                </Typography>
              </Grid>
            </CardContent>
          }
        </Card>
      </a>
      <DialogEventActions
        event={props.data.event}
        controllerOpen={[open, setOpen]}
        viewEvent={props.data.viewEvent}
        onEventStateChange={props.data.onEventStateChange}
      />
    </>
  )
}

export interface ToolBarControlsProps {
  controllerFilters: [CalendarType.EventFilters, (value: CalendarType.EventFilters) => void]
}

export const ToolBarControls: FC<ToolBarControlsProps> = (props) => {

  const classes = useStyles({});

  const [filters, setFilters] = props.controllerFilters;

  return (
    <Grid
      container
      direction="row"
      className={classes.toolbar}
    >
      {Object.entries(filters).map(([label, value]) => (
        <FormControlLabel
          key={label}
          label={label}
          control={
            <Switch
              checked={value}
              onClick={() => {
                setFilters({
                  ...filters,
                  [label]: !filters[label],
                });
              }}
              color="primary"
            />
          }
        />
      ))}
    </Grid>
  );
}

export interface CalendarProps {
  data: Data.Data
  /** If true, will display DialogEventActions when calendar item is selected */
  withDialog?: boolean
  controllerFilters?: [CalendarType.EventFilters, (value: CalendarType.EventFilters) => void]
  controllerDate?: [Date, (value: Date) => void]
  controllerView?: [CalendarType.View, (value: CalendarType.View) => void]
  onClickItem?: (event: Data.Event) => void
  onEventStateChange?: (event: Data.Event) => void
  viewEvent?: (event: Data.Event) => void
}

const Calendar: FC<CalendarProps> = (props) => {

  const [calendarDate, setCalendarDate] = props.controllerDate ?
    props.controllerDate :
    useState(new Date());

  const [calendarView, setCalendarView] = props.controllerView ?
    props.controllerView :
    useState<CalendarType.View>("Week");

  const [filters, setFilters] = props.controllerFilters ??
    useState<CalendarType.EventFilters>({
      Confirmed: true,
      Offer: true,
      Cancelled: true,
    });

  const handleDateNavigation = (date: Date) => {
    if (calendarView === "3Days") {
      const diffTime = date.valueOf() - calendarDate.valueOf();
      const newDate = new Date(calendarDate.valueOf() + diffTime * 3 / 7);
      setCalendarDate(newDate);
    } else {
      setCalendarDate(date);
    }
  }

  const get3DayExluded = () => {
    const day = calendarDate.getDay();
    const exludeds = [];

    for (let i = 0; i < 7; i++) {
      if (Math.abs(day - i) > 1) {
        exludeds.push(i);
      }
    }

    // for Sunday (0) & Saturday (6)
    // add either Tuesday (2) or Thursday (4)
    // to keep 3 days in total
    if (day == 0) {
      delete exludeds[0];
    } else if (day == 6) {
      delete exludeds[4];
    }
    return exludeds;
  };

  const isEventValid = (event: Data.Event, filters: CalendarType.EventFilters) => {
    for (const [label, keep] of Object.entries(filters)) {
      if (!keep && event.labels.find(l => l.name === label)) {
        return false;
      }
      if (!keep && event.status == label) {
        return false;
      }
    }
    return true;
  }

  const formatData = (data: Data.Data) => {
    if (data.events.length == 0 || data.clients.length == 0) {
      return [];
    }

    const events: CalendarItemProps[] = [];
    for (const [id, event] of Object.entries(data.events)) {

      // filter events
      if (!isEventValid(event, filters)) {
        continue;
      }

      const startDate = new Date(event.date);
      const endDate = new Date(startDate);

      // set endDate one hour later (a date must be set)
      endDate.setHours(startDate.getHours() + 1);

      events.push({
        withDialog: !!props.withDialog,
        startDate,
        endDate,
        view: calendarView,
        event,
        onEventStateChange: props.onEventStateChange,
        viewEvent: props.viewEvent,
        onClick: props.onClickItem,
      });
    }
    return events;
  }

  return (
    <Scheduler
      data={formatData(props.data)}
    >
      <ViewState
        currentDate={calendarDate}
        onCurrentDateChange={handleDateNavigation}
        currentViewName={calendarView}
        onCurrentViewNameChange={(view) => { setCalendarView(view as CalendarType.View); }}
      />
      <WeekView
        name="Week"
        displayName="Week"
        cellDuration={60}
        startDayHour={0}
        endDayHour={24}
      />
      <WeekView
        name="3Days"
        displayName="3 days"
        cellDuration={60}
        startDayHour={0}
        endDayHour={24}
        excludedDays={get3DayExluded()}
      />
      <MonthView
        name="Month"
        displayName="Month"
      />
      <Toolbar />
      <ViewSwitcher />
      <DateNavigator />
      <Appointments
        // @ts-ignore
        appointmentComponent={CalendarItem}
      />
    </Scheduler>
  )
}

export default Calendar;