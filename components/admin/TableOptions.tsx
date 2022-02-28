// mui
import { makeStyles } from "@material-ui/core";
import {
  IconButton,
  Tooltip,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
} from "@material-ui/core";

import EditIcon from '@material-ui/icons/Edit';
import RemoveIcon from '@material-ui/icons/Remove';

// utils
import { formatNumber, isNumber, isColor } from "../../utils/Helper";
import TitleOptions from "./TitleOptions";

const useStyles = makeStyles((theme) => ({
  table: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  icon: {
    height: theme.spacing(2.5),
    width: theme.spacing(2.5),
  },
}));

export interface TableOptionsProps<T> {
  title: string
  data: T[]
  headers: (keyof T)[]
  add?: () => void
  modify?: (item: T) => void
  delete?: (item: T) => void
}

function TableOptions<T>(props: TableOptionsProps<T>) {

  const classes = useStyles();

  let nCol = props.headers.length - 1;
  if (props.add) { nCol--; }
  if (props.modify) { nCol++; }
  if (props.delete) { nCol++; }

  const renderValue = (value: any) => {
    if (isNumber(value)) {
      return formatNumber(value);
    }
    if (isColor(value)) {
      return (
        <Avatar
          style={{ backgroundColor: value }}
          className={classes.icon}
        >
          {" "}
        </Avatar>
      );
    }
    return value;
  }

  return (
    <>
      <TitleOptions
        title={props.title}
        add={props.add}
      />
      <Table className={classes.table}>
        <TableBody>
          {props.data.map((item) => (
            <TableRow>
              {props.headers.map((header) => (
                <TableCell>
                  {renderValue(item[header])}
                </TableCell>
              ))}

              {props.modify &&
                <TableCell
                  padding="none"
                  align={props.delete ? "right" : "center"}
                >
                  <Tooltip title="Éditer" arrow>
                    <IconButton
                      onClick={() => {
                        if (!props.modify) { return; }
                        props.modify(item);
                      }}
                    >
                      <EditIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              }
              {props.delete &&
                <TableCell
                  padding="none"
                  align="center"
                >
                  <Tooltip title="Enlever" arrow>
                    <IconButton
                      onClick={() => {
                        if (!props.delete) { return; }
                        props.delete(item);
                      }}
                    >
                      <RemoveIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              }
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

export default TableOptions;