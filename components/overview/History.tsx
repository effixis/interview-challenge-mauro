// react
import { FC, useEffect, useState } from 'react';

// mui
import {
  Paper,
  Collapse,
  Tab,
  Tabs
} from '@material-ui/core';

// utils
import { Data, Calendar } from '../../utils/types';
import { isAfter } from 'date-fns'
import { eventParams } from '../../utils/MasterTableParams';
import MasterTable from '../MasterTable';


export interface HistoryProps {
  data: Data.Data
  client?: Data.Client
  size?: 'medium' | 'small',
  onClick?: (event: Data.Event) => void
  onSelect?: (selection: string[]) => void
  filters?: Calendar.EventFilters
  selected?: string[]
  selectedClient?: Data.Client | null
}

const History: FC<HistoryProps> = (props) => {

  type TabsChoice = "expected" | "expired" | "client"
  const [currentTab, setCurrentTab] = useState<TabsChoice>("expected");

  const isEventValid = (event: Data.Event, filters: Calendar.EventFilters) => {
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

  let events = [];
  if (props.client) {
    const id = props.client.id;
    events = props.data.events.filter((e) => e.client.id === id);
  } else {
    events = props.data.events;
  }

  // sorting the events by date
  if (events.length > 0) {
    events.sort((a, b) => isAfter(new Date(a.date), new Date(b.date)) ? -1 : 1)
  }

  // filtering the events
  if (props.filters) {
    const filters = props.filters;
    events = events.filter(e => isEventValid(e, filters));
  }

  // splitting the event between 'already happened' and 'in the future'
  let expectedEvents = events.filter(e => isAfter(new Date(e.date), new Date()));
  let expiredEvents = events.filter(e => !isAfter(new Date(e.date), new Date()));
  let clientEvents: Data.Event[] = [];
  if (props.selectedClient) {
    clientEvents = events.filter(e => e.client.id === props.selectedClient?.id);
  }

  const handleRowClick = (row: Data.Event) => {
    if (props.onClick) {
      props.onClick(row);
    }
    if (props.onSelect) {
      let sel = props.selected || [];
      const id = row.id;
      const index = sel.indexOf(id);
      if (index < 0) {
        sel = [id];
      }
      props.onSelect(sel)
    }
  }

  useEffect(() => {
    if (props.selectedClient) {
      setCurrentTab('client')
    }
    else {
      setCurrentTab('expected')
    }
  }, [props.selectedClient]);

  return (
    <>
      <Tabs
        value={currentTab}
        onChange={(e, value) => { setCurrentTab(value); }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab
          label="Attendus"
          value="expected"
        />
        <Tab
          label="Terminés"
          value="expired"
        />
        <Tab
          disabled={!props.selectedClient}
          label={props.selectedClient?.name || ""}
          value="client"
        />
      </Tabs>
      <Collapse in={currentTab === "expected"}>
        <Paper>
          <MasterTable<Data.Event>
            id="expected-events"
            title="Evènements attendus"
            data={expectedEvents}
            headers={eventParams}
            onRowClick={handleRowClick}
            selected={props.selected}
          />
        </Paper>
      </Collapse>
      <Collapse in={currentTab === "expired"}>
        <Paper>
          <MasterTable<Data.Event>
            id="expired-events"
            title="Evènements terminés"
            data={expiredEvents}
            headers={eventParams}
            onRowClick={handleRowClick}
            selected={props.selected}
          />
        </Paper>
      </Collapse>
      <Collapse in={currentTab === "client"}>
        <Paper>
          <MasterTable<Data.Event>
            id="owned-events"
            title={`Evènements de ${props.selectedClient?.name}`}
            data={clientEvents}
            headers={eventParams}
            onRowClick={handleRowClick}
            selected={props.selected}
          />
        </Paper>
      </Collapse>
    </>
  )
}

export default History;