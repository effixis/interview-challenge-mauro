// react
import { FC, useState, useRef } from 'react';

// mui
import { useTheme, makeStyles } from '@material-ui/core/styles';
import {
  Typography,
  Grid,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Chip,
  Menu,
  MenuItem,
  IconButton,
} from '@material-ui/core';

import LocationOnIcon from '@material-ui/icons/LocationOn';
import PersonIcon from '@material-ui/icons/Person';
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder';
import EventIcon from '@material-ui/icons/Event';
import AddIcon from '@material-ui/icons/Add';

// utils
import { Data } from '../../utils/types';
import { getFormattedAddress } from '../../utils/Helper';

// hooks
import { useData } from '../../hooks/useData';

const useStyles = makeStyles((theme) => ({
  dialog: {
    minWidth: theme.spacing(60),
  },
  title: {
    marginRight: theme.spacing(3),
  },
  subtitle: {
    paddingLeft: theme.spacing(1),
  },
  infoItem: {
    padding: theme.spacing(1),
  },
  chip: {
    color: "white",
    margin: theme.spacing(0, 0.5),
  },
}));

export interface DialogEventActionsProps {
  event: Data.Event
  controllerOpen: [boolean, (open: boolean) => void]
  onEventStateChange?: (event: Data.Event) => void
  viewEvent?: (event: Data.Event) => void
}

const DialogEventActions: FC<DialogEventActionsProps> = (props) => {

  const classes = useStyles();
  const { data } = useData();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState(false);

  const [open, setOpen] = props.controllerOpen;

  // current label idx or -1 (new label)
  const [labelIdx, setLabelIdx] = useState(-1);

  const currentAvailableLabels = useRef<Data.Label[]>([]);

  const isUniqueLabel = (label: Data.Label) => {
    return (label.name === "Offer"
      || label.name === "Confirmed"
      || label.name === "Cancelled");
  }

  const getUniquesLabels = (label: Data.Label) => {
    return data.config.labels.filter(
      l => isUniqueLabel(l) && l.name !== label.name
    );
  }

  // select available labels
  const availableLabels = data.config.labels
    .filter(label => !isUniqueLabel(label))
    .filter(label => (
      !props.event.labels.find((label2) => (label.id === label2.id))
    ));


  const updateLabel = (label: Data.Label) => {
    if (labelIdx == -1) {
      // add new label
      props.event.labels.push(label)
    } else {
      // modify existing one
      props.event.labels[labelIdx] = label;
      if (isUniqueLabel(label)) {
        props.event.status = label.name as Data.EventStatus;
      }
    }
    if (props.onEventStateChange) {
      props.onEventStateChange(props.event);
    }
  }

  const deleteLabel = (idx: number) => {
    if (props.onEventStateChange) {
      props.onEventStateChange({
        ...props.event,
        labels: props.event.labels.filter((v, i) => i != idx),
      });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => { setOpen(false); }}
      maxWidth={false}
    >
      <DialogTitle
        className={classes.dialog}
      >
        <Grid
          container
          direction="row"
          justify="space-between"
        >
          <div className={classes.title}>
            {props.event.client.name}
          </div>
          <div>
            {props.event.labels.map((label, i) => (
              <Chip
                key={label.id}
                label={label.name}
                onClick={(e) => {
                  setAnchorEl(e.currentTarget)
                  setOpenMenu(true)
                  setLabelIdx(i);
                  if (isUniqueLabel(label)) {
                    currentAvailableLabels.current = getUniquesLabels(label);
                  } else {
                    currentAvailableLabels.current = availableLabels;
                  }
                }}
                onDelete={!isUniqueLabel(label) ? () => {
                  deleteLabel(i);
                  setOpenMenu(false);
                } : undefined}
                style={{ backgroundColor: label.color }}
                className={classes.chip}
              />
            ))}
            {availableLabels.length > 0 &&
              <IconButton
                onClick={(e) => {
                  setAnchorEl(e.currentTarget)
                  setOpenMenu(true)
                  setLabelIdx(-1);
                  currentAvailableLabels.current = availableLabels;
                }}
                size="small">
                <AddIcon />
              </IconButton>
            }
          </div>
        </Grid>
        <Menu
          open={openMenu}
          anchorEl={anchorEl}
          onClose={() => { setOpenMenu(false) }}
        >
          {currentAvailableLabels.current.map(label => (
            <MenuItem
              key={label.id}
              onClick={() => {
                updateLabel(label);
                setOpenMenu(false);
              }}
            >
              <Chip
                label={label.name}
                style={{ backgroundColor: label.color, color: "white", margin: "auto" }}
              />
            </MenuItem>
          ))}
        </Menu>
      </DialogTitle>

      <DialogContent>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
          className={classes.infoItem}
        >
          <Grid item>
            <Grid container direction="row" alignItems="center">
              <EventIcon />
              <Typography
                component="span"
                variant="subtitle2"
                color="textSecondary"
                className={classes.subtitle}
              >
                Date
              </Typography>
            </Grid>
          </Grid>
          <Typography component="span" variant="body2" color="textPrimary">
            {new Date(props.event.date).toLocaleDateString("fr-CH")}
          </Typography>
        </Grid>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
          className={classes.infoItem}
        >
          <Grid item>
            <Grid container direction="row" alignItems="center">
              <QueryBuilderIcon />
              <Typography
                component="span"
                variant="subtitle2"
                color="textSecondary"
                className={classes.subtitle}
              >
                Hour
              </Typography>
            </Grid>
          </Grid>
          <Typography component="span" variant="body2" color="textPrimary">
            {new Date(props.event.date).toLocaleTimeString("fr-CH")}
          </Typography>
        </Grid>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
          className={classes.infoItem}
        >
          <Grid item>
            <Grid container direction="row" alignItems="center">
              <PersonIcon />
              <Typography
                component="span"
                variant="subtitle2"
                color="textSecondary"
                className={classes.subtitle}
              >
                People
              </Typography>
            </Grid>
          </Grid>

          <Typography component="span" variant="body2" color="textPrimary">
            {props.event.people}
          </Typography>
        </Grid>

        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
          className={classes.infoItem}
        >
          <Grid item>
            <Grid container direction="row" alignItems="center">
              <LocationOnIcon />
              <Typography
                component="span"
                variant="subtitle2"
                color="textSecondary"
                className={classes.subtitle}
              >
                Address
              </Typography>
            </Grid>
          </Grid>
          <Typography component="span" variant="body2" color="textPrimary">
            {getFormattedAddress(props.event.address)}
          </Typography>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => { setOpen(false); }}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={() => {
            setOpen(false);
            if (props.viewEvent) {
              props.viewEvent(props.event);
            }
          }}
        >
          View Event
        </Button>

      </DialogActions>
    </Dialog>
  );
}

export default DialogEventActions;