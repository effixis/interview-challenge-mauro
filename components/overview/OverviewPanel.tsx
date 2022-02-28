// react
import React, { FC, MouseEventHandler, useEffect } from 'react';

// mui
import { makeStyles } from '@material-ui/core/styles';
import {
  Typography,
  Button,
  Grid,
} from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import MuiAccordionActions from '@material-ui/core/AccordionActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Palette } from '@material-ui/icons';


const Accordion = withStyles({
  root: {
    boxShadow: 'none',
    border: '1px solid transparent',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto'
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles((theme) => ({
  root: {
    position: 'relative',
    padding: 0,
    minHeight: 0,
    '&$expanded': {
      minHeight: 0,
    }
  },
  content: {
    padding: theme.spacing(1) + "px " + theme.spacing(2) + "px",
    display: "flex",
    margin: '0',
    '&$expanded': {
      margin: '0',
    },
  },
  expandIcon: {
    padding: theme.spacing(1) + "px",
    marginRight: 0,
    position: "relative",
    right: theme.spacing(1)
  },
  expanded: {

  },
}))(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiAccordionDetails);

const AccordionActions = withStyles((theme) => ({
  root: {
    borderBottom: '1px solid rgba(0, 0, 0, .125)'
  },
}))(MuiAccordionActions);


const useStyles = makeStyles((theme) => ({
  root: {
    //border: '1px solid rgba(0,0,0,0.2)'
  },
  heading: {

  },
  primaryDetails: {
    display: "block",
    padding: theme.spacing(1)
  },
  details: {
    display: "block"
  },
  panelPrimaryTitle: {
    alignSelf: "center",
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginRight: theme.spacing(2)
  },
  panelPrimaryTitleError: {
    alignSelf: "center",
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginRight: theme.spacing(2),
    color: theme.palette.error.main
  },
  panelPrimaryHighlightedTitle: {
    alignSelf: "center",
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main
  },
  panelPrimaryHighlightedTitleError: {
    alignSelf: "center",
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginRight: theme.spacing(2),
    color: theme.palette.error.main
  },
  panelTitle: {
    alignSelf: "center",
    fontSize: "1rem",
    fontWeight: "bold",
    marginRight: theme.spacing(2),
  },
  panelTitleError: {
    alignSelf: "center",
    fontSize: "1rem",
    fontWeight: "bold",
    marginRight: theme.spacing(2),
    color: theme.palette.error.main
  },
  panelSubtitle: {
    alignSelf: "center",
    display: "flex",
    gap: theme.spacing(0.5),
    marginRight: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  panelTotal: {
    alignSelf: "center",
    fontSize: "1rem",
    marginLeft: "auto"
  },
  leftBtn: {
    marginRight: "auto"
  },
  sepLine: {
    position: "absolute",
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    bottom: 0,
    left: theme.spacing(1),
    right: theme.spacing(1)
  },
  iconPanel: {
    marginRight: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    opacity: "0.3"
  },
  iconPanelError: {
    marginRight: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    opacity: "1",
    color: theme.palette.error.main
  }
}));

type SubtitleWithIcon = {
  text?: string | number | null
  icon?: React.ReactElement<any, string | React.JSXElementConstructor<any>>
}

export interface OverviewPanelProps {
  name: string
  title?: string
  subtitle?: string
  subtitles?: SubtitleWithIcon[]
  total?: string
  expanded: Array<string>
  noActions?: boolean
  primary?: boolean
  panelsList: { [x: string]: string; }
  onClick: (newExpanded: Array<string>) => void
  nextLabel?: string
  onNext?: MouseEventHandler<HTMLButtonElement>
  previousLabel?: string
  onPrevious?: MouseEventHandler<HTMLButtonElement>
  icon?: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined
  highlighted?: boolean
  transferMode?: boolean
  disabled?: boolean
  onEmpty?: () => void
  error?: boolean
  titlesForNav?: boolean
}

const OverviewPanel: FC<OverviewPanelProps> = (props) => {
  const classes = useStyles();

  const togglePanel = (target: string) => {
    if (props.expanded.indexOf(target) >= 0) {
      props.onClick(props.expanded.length > 1 ? props.expanded.filter(e => e !== target) : []);
    }
    else {
      props.onClick([...props.expanded, target]);
    }
  }

  const getListId = (add: number) => {
    const id = Object.keys(props.panelsList).indexOf(props.name)
    return id + add;
  }

  const getRelatedLabel = (add: number) => {
    if (props.panelsList) {
      const target = Object.keys(props.panelsList)[getListId(add)];
      return props.panelsList[target];
    }
  }

  const handleNext = () => {
    if (props.panelsList) {
      props.onClick([Object.keys(props.panelsList)[getListId(+1)]]);
    }
  }

  const handleBack = () => {
    if (props.panelsList) {
      props.onClick([Object.keys(props.panelsList)[getListId(-1)]]);
    }
  }

  const handleClose = () => {
    if (props.panelsList) {
      props.onClick(props.expanded.filter(e => e !== props.name));
    }
  }

  const getTitleClass = () => {
    if (props.primary && props.highlighted) {
      return props.error ?
        classes.panelPrimaryHighlightedTitleError :
        classes.panelPrimaryHighlightedTitle;
    }
    else if (props.primary) {
      return props.error ?
        classes.panelPrimaryTitleError :
        classes.panelPrimaryTitle;
    }
    return props.error ?
        classes.panelTitleError :
        classes.panelTitle;
  }

  return (
    <Accordion
      className={classes.root}
      expanded={props.expanded.indexOf(props.name) >= 0}
      onChange={() => { togglePanel(props.name) }}
    >
      <AccordionSummary
        id={`panel-${props.name}`}
        expandIcon={props.primary ? <ExpandMoreIcon /> : null}
      >
        <Grid container direction="row">
          {props.icon && (
            <Grid item className={props.error ? classes.iconPanelError : classes.iconPanel}>
              {props.icon}
            </Grid>
          )}
          {props.title && (
            <Typography

              className={getTitleClass()}
            >
              {props.title}
            </Typography>
          )}
          {!props.title && (
            <Typography
              className={getTitleClass()}
            >
              {props.panelsList[props.name]}
            </Typography>
          )}
          {props.subtitle && (
            <Grid item xs className={classes.panelSubtitle}>
              <Typography className={classes.panelSubtitle} noWrap>{props.subtitle}</Typography>
            </Grid>
          )}
          {props.subtitles && props.subtitles.map(bloc => {
            if (bloc.text) {
              return (
                <Grid item zeroMinWidth key={bloc.text} className={classes.panelSubtitle}>
                  {bloc.icon}
                  <Typography className={classes.panelSubtitle} noWrap>{bloc.text}</Typography>
                </Grid>
              )
            }
            return null;
          })}
          {props.total && (
            <Typography className={classes.panelTotal}>{props.total}</Typography>
          )}
        </Grid>
        <div className={classes.sepLine}></div>
      </AccordionSummary>
      <AccordionDetails className={props.primary ? classes.primaryDetails : classes.details}>
        {props.children}
      </AccordionDetails>
      {!props.noActions && (
        <AccordionActions>
          {!!props.onEmpty && (
            <Button
              variant="contained"
              disableElevation
              size="small"
              className={classes.leftBtn}
              disabled={props.disabled}
              onClick={props.onEmpty}
            >
              Vider
            </Button>
          )}
          {props.panelsList && (
            <>
              {Object.keys(props.panelsList).indexOf(props.name) > 0 && (
                <Button variant="outlined" size="small" onClick={handleBack}>{props.titlesForNav ? getRelatedLabel(-1) : "Précédent"}</Button>
              )}
              {props.previousLabel && props.onPrevious && (
                <Button variant="outlined" size="small" onClick={props.onPrevious}>{props.previousLabel || "Précédent"}</Button>
              )}
              {Object.keys(props.panelsList).indexOf(props.name) < Object.keys(props.panelsList).length - 1 && (
                <Button variant="outlined" size="small" onClick={handleNext} color="primary">{props.titlesForNav ? getRelatedLabel(+1) : "Suivant"}</Button>
              )}
              {props.nextLabel && props.onNext && (
                <Button variant="outlined" size="small" onClick={props.onNext} color="primary">{props.nextLabel || "Suivant"}</Button>
              )}
              {false && (
                <Button variant="outlined" size="small" onClick={handleClose}>Ok</Button>
              )}
            </>
          )}
        </AccordionActions>
      )}
    </Accordion>
  )
}

export default OverviewPanel;