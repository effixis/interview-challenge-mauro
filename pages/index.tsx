// next
import { useRouter } from 'next/router';

// react
import { FC, useEffect, useState } from 'react';

// mui
import {
  Button,
  Collapse,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Tooltip,
  Typography,
} from '@material-ui/core';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';

// utils
import { Data, Calendar as CalendarType, Optional } from '../utils/types';

// hooks
import { useData } from '../hooks/useData';

// components
import Page from '../components/Page';
import Calendar, { ToolBarControls } from '../components/overview/Calendar';
import History from '../components/overview/History';
import OverviewEditor, { TransferPayload } from '../components/editor/OverviewEditor';


const useStyles = makeStyles((theme) => ({
  paper: {
    margin: theme.spacing(1),
    padding: theme.spacing(2)
  },
  withMargin: {
    margin: theme.spacing(1)
  },
  landingHeader: {
    display: "flex",
    gap: theme.spacing(2),
    flexWrap: "wrap",
    alignItems: "center",
    margin: theme.spacing(1),
    minHeight: theme.spacing(6),
  },
}));

export interface PageOverviewProps { }

const PageOverview: FC<PageOverviewProps> = (props) => {

  const classes = useStyles();
  const { data, update } = useData();
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [event, setEvent] = useState<Data.Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Data.Event | null>(null);
  const [localClient, setLocalClient] = useState<Data.Client | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [creationMode, setCreationMode] = useState<boolean>(false);
  const [localSelection, setLocalSelection] = useState<string[]>([]);
  const [transferPayload, setTransferPayload] = useState<TransferPayload | undefined>({});
  const [filters, setFilters] = useState<CalendarType.EventFilters>({} as CalendarType.EventFilters);

  // partial event update
  const updateEventStatus = (event: Data.Event) => {
    update({
      events: [event]
    });
  }

  const getEventByID = (id: string) => {
    return data.events.find((c) => c.id === id);
  }

  const defaultToFalse = {
    Offer: false,
    Cancelled: false
  } as {[key: keyof CalendarType.EventFilters]: boolean};

  // injecting the event (id in url) on each data change
  useEffect(() => {
    const routerId = router.query.id;
    // check that the potential given id is valid
    if (routerId && typeof routerId === "string" && !event) {
      const e = getEventByID(routerId);
      if (!e) return;
      setEventValue(e)
      setEditMode(false)
    }

    if (data.ready && Object.keys(filters).length == 0) {
      // create default value for event filters
      const _filters: CalendarType.EventFilters = {
        Confirmed: true,
        Offer: true,
        Cancelled: true,
      };
      for (const label of data.config.labels) {
        _filters[label.name] = true;
      };
      
      for(const p in _filters) {
        _filters[p] = defaultToFalse[p] !== undefined ? defaultToFalse[p] : true
      }

      setFilters(_filters);
    }

  }, [data]); // trigger after every data update -> wait til ready

  const prepareCreation = () => {
    setCreationMode(true)
    setEditMode(true)
    setEventValue(null)
  }

  const setEventValue = (event: Data.Event | null) => {
    setEvent(event)

    if (event && event.client) {
      setLocalClient(event.client)
    }
    else {
      setLocalClient(null)
    }
    // scroll to the top
    window.scrollTo(0, 0);
  }

  const handleClientChange = (client: Data.Client | null) => {
    setLocalClient(client)
  }

  const handleDateChange = (date: Date) => {
    setDate(date);
  }

  const bicols = event !== null || creationMode;
  const firstColWidth = editMode || creationMode ? 6 : (bicols ? 5 : 12);
  const secondColWidth = editMode || creationMode ? 6 : (event !== null || creationMode ? 7 : 12);

  const handleSetEvent = (event: Data.Event | null) => {
    if (event === null) {
      // when canceling the local event, remove the event id from the url
      router.push(router.route);
    }
    if ((editMode || creationMode) && selectedEvent === null) {
      event === null ? setEditor(event) : setSelectedEvent(event);
    }
    else {
      setEditor(event);
    }
  }

  const setEditor = (event: Data.Event | null) => {
    setSelectedEvent(null)
    setEventValue(event)
    setLocalSelection(event ? [event.id] : []);
    setEditMode(false)
    setCreationMode(false)
    if (event?.id) {
      router.push(router.route + '?id=' + event.id);
    }
  }


  const handleTransfer = (target: TransferPayload["target"], items: TransferPayload["items"]) => {
    setTransferPayload({ target, items });
  }

  const handleCreateEvent = (event: Optional<Data.Event, "id">) => {
    if(event) {
      setEditor(event as Data.Event);
    }
  }

  return (
    <Page
      withAuth
      withData
      title="Overview"
    >
      <Grid container direction="row">
        <Grid item xs={firstColWidth}>
          <Collapse className={classes.withMargin} in={(event !== null || creationMode)}>
            <OverviewEditor
              onEditModeChange={setEditMode}
              onChange={handleSetEvent}
              onClientChange={handleClientChange}
              onDateChange={handleDateChange}
              event={event}
              editMode={editMode}
              creationMode={creationMode}
              transferPayload={transferPayload}
              onCreate={handleCreateEvent}
              useBackIcon
            >
              <Collapse in={bicols}>
                {event && editMode && (
                  <Grid container>
                    <Button variant="outlined" onClick={() => { setEditMode(false) }}>
                      Visualiser
                    </Button>
                  </Grid>
                )}
                {!editMode && (
                  <Grid>
                    <Button variant="outlined" color="primary" onClick={() => { setEditMode(true) }}>
                      Modifier
                    </Button>
                  </Grid>
                )}
                {creationMode && (
                  <Typography variant='h5' component="h2">Nouvel évènement</Typography>
                )}
              </Collapse>
            </OverviewEditor>
          </Collapse>
          {event === null && !creationMode && (
            <Grid container direction='row' alignContent='flex-start' className={classes.landingHeader}>
              <Grid item>
                <Button variant="contained" color="primary" onClick={prepareCreation}>
                  Créer un évènement
                </Button>
              </Grid>
              <Grid item>
                <Typography color="textSecondary">Sélectionnez un évènement pour le visualiser</Typography>
              </Grid>
            </Grid>
          )}
        </Grid>
        <Grid item xs={secondColWidth}>
          <Collapse in={!!selectedEvent} className={classes.withMargin}>
            <OverviewEditor
              event={selectedEvent}
              transferMode
              onChange={() => { setSelectedEvent(null) }}
              onTransfer={handleTransfer}
            >
              <Tooltip title="Cancel">
                <IconButton aria-label="cancel" onClick={() => { setSelectedEvent(null) }}>
                  <KeyboardBackspaceIcon />
                </IconButton>
              </Tooltip>
            </OverviewEditor>
          </Collapse>
          <Collapse in={!selectedEvent}>
            <Grid className={classes.withMargin}>
              <History
                data={data}
                onClick={(event) => {
                  handleSetEvent(event);
                  setDate(new Date(event.date));
                }}
                filters={filters}
                selected={localSelection}
                selectedClient={localClient}
              />
            </Grid>
            <Paper className={classes.paper}>
              <ToolBarControls
                controllerFilters={[filters, setFilters]}
              />
              <Calendar
                data={data}
                onClickItem={handleSetEvent}
                controllerFilters={[filters, setFilters]}
                controllerDate={[date, setDate]}
                viewEvent={handleSetEvent}
                onEventStateChange={updateEventStatus}
              />
            </Paper>
          </Collapse>
        </Grid>
      </Grid>
    </Page>
  )
}

export default PageOverview;