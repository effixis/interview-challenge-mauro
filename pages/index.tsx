// react
import { FC, useState } from 'react';

// mui
import {
  Collapse,
  Grid,
  makeStyles,
} from '@material-ui/core';

// utils
import { Data, Calendar as CalendarType } from '../utils/types';

// hooks
import { useData } from '../hooks/useData';

// components
import Page from '../components/Page';
import History from '../components/overview/History';


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
  const { data } = useData();

  const [localClient, setLocalClient] = useState<Data.Client | null>(null);
  const [localSelection, setLocalSelection] = useState<string[]>([]);
  const [filters, setFilters] = useState<CalendarType.EventFilters>({} as CalendarType.EventFilters);

  const handleSetEvent = (event: Data.Event | null) => {
    // handle the click event here !
  }

  return (
    <Page
      withAuth
      withData
      title="Overview"
    >
      <Grid container direction="column">
        <Grid item>
          <Collapse in={true}>
            <Grid className={classes.withMargin}>
              <History
                data={data}
                onClick={(event) => {
                  handleSetEvent(event);
                }}
                filters={filters}
                selected={localSelection}
                selectedClient={localClient}
              />
            </Grid>
          </Collapse>
        </Grid>
        <Grid>

          Insert page content here !

        </Grid>
      </Grid>
    </Page>
  )
}

export default PageOverview;