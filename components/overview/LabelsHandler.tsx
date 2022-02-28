// react
import { FC, useState, useRef, useEffect } from 'react';

// mui
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Chip,
  Menu,
  MenuItem,
  IconButton,
} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';

// utils
import { Data, Inputs } from '../../utils/types';

// hooks
import { useData } from '../../hooks/useData';
import { Input } from '../../utils/Input';

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

export interface LabelsHandlerProps {
  disabled?: boolean
  controller: Input.InputProps<Inputs.Labels>
  addButton?: boolean
  onChange?: (label: Data.Label) => void
}

const LabelsHandler: FC<LabelsHandlerProps> = (props) => {

  const classes = useStyles();
  const { data, update } = useData();
  const input = props.controller;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<Data.Label | Data.LabelStatus | null>(null);

  const statusLabel = data.config.labelsStatus.find(
    (label) => label.status === input.values.status
  ) as Data.LabelStatus;

  const getLabelOptions = () => {
    const options = [];
    for (const label of data.config.labels) {
      if (!input.values.labels.find(l => l.id === label.id)) {
        options.push(label);
      }
    }
    return options;
  }

  const getLabelStatusOptions = () => {
    return data.config.labelsStatus.filter(
      (label) => label.status !== input.values.status
    );
  }

  const isStatusLabel = (l: any): l is Data.LabelStatus => (!!l.status);

  const getCurrentOptions = () => {
    if (!currentLabel || !isStatusLabel(currentLabel)) {
      return getLabelOptions();
    } else {
      return getLabelStatusOptions();
    }
  }

  const updateLabel = (label: Data.Label) => {
    if (!currentLabel) {
      // add new label
      input.values.labels.push(label)
    } else if (isStatusLabel(label)) {
      // update event status
      input.values.status = label.status;
    } else {
      // update existing label
      const idx = input.values.labels.findIndex(l => l.id === label.id);
      if (idx == -1) { return; }
      input.values.labels[idx] = label;
    }
    input.setValues({ ...input.values });
    if(props.onChange) {
      props.onChange(label);
    }
  }

  const deleteLabel = (label: Data.Label) => {
    input.values.labels = input.values.labels.filter(l => l.id !== label.id);
    input.setValues({ ...input.values });
  }

  return (
    <>
      <Grid
        container
        direction="row"
        justify="flex-end"
      >
        <Chip
          disabled={props.disabled}
          label={statusLabel.name}
          onClick={(e) => {
            e.stopPropagation();
            setAnchorEl(e.currentTarget);
            setOpen(true);
            setCurrentLabel(statusLabel);
          }}
          style={{ backgroundColor: statusLabel.color }}
          className={classes.chip}
        />
        {input.values.labels.map(label => (
          <Chip
            key={label.id}
            disabled={props.disabled}
            label={label.name}
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl(e.currentTarget);
              setOpen(true);
              setCurrentLabel(label);
            }}
            onDelete={() => {
              deleteLabel(label);
              setOpen(false);
            }}
            style={{ backgroundColor: label.color }}
            className={classes.chip}
          />
        ))}
        {!props.disabled && props.addButton && getLabelOptions().length > 0 &&
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl(e.currentTarget);
              setOpen(true);
              setCurrentLabel(null);
            }}
            size="small">
            <AddIcon />
          </IconButton>
        }
      </Grid>
      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={() => { setOpen(false) }}
      >
        {getCurrentOptions().map(label => (
          <MenuItem
            key={label.id}
            onClick={() => {
              updateLabel(label);
              setOpen(false);
            }}
          >
            <Chip
              label={label.name}
              style={{ backgroundColor: label.color, color: "white", margin: "auto" }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default LabelsHandler;