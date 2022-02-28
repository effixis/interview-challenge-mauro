// react
import { useEffect, useState } from 'react';
import clsx from 'clsx';

// mui
import { createStyles, lighten, makeStyles, Theme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import AddIcon from '@material-ui/icons/Add';
import TuneIcon from '@material-ui/icons/Tune';
import CheckIcon from '@material-ui/icons/Check';
import KeyboardReturnIcon from '@material-ui/icons/KeyboardReturn';
import SearchIcon from '@material-ui/icons/Search';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import EditIcon from '@material-ui/icons/Edit';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Checkbox,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  TextField,
  Collapse,
  Chip
} from '@material-ui/core';

// utils
import { Data, Models, Optional } from '../utils/types';
import { InputProvider, InputField, InputFieldProps, Input, useInput, buildHierarchyOptions } from '../utils/Input';
import { drinksParams, HeadCell, materialParams, menusParams, platsParams } from '../utils/MasterTableParams';
import { deepCopy, isArray } from '../utils/Helper';
import {
  drinksDefaultValues,
  materialsDefaultValues,
  menusDefaultValues,
  platsDefaultValues
} from '../utils/defaultValues';

// hooks
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';

// components
import { ExpectedTarget, ItemSubTable, OverviewQuickList } from './editor/OverviewLists';
import OverviewQuickForm from './editor/OverviewQuickForm';
import SearchField from './SearchField';


// Head
interface MasterTableHeadProps<T> {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: 'asc' | 'desc';
  orderBy: keyof T;
  rowCount: number;
  headers: HeadCell<T>[];
  deleteIcon: boolean;
  checkbox?: boolean;
  noEdit?: boolean
}

function MasterTableHead<T>(props: MasterTableHeadProps<T>) {
  const classes = useStyles();
  const createSortHandler = (property: keyof T) => (event: React.MouseEvent<unknown>) => {
    if (props.onRequestSort) {
      props.onRequestSort(event, property);
    }
  };

  return (
    <TableHead>
      <TableRow>
        {props.checkbox && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={props.numSelected > 0 && props.numSelected < props.rowCount}
              checked={props.rowCount > 0 && props.numSelected === props.rowCount}
              onChange={props.onSelectAllClick}
              inputProps={{ 'aria-label': 'select all desserts' }}
            />
          </TableCell>
        )}
        {props.headers.map((headCell) => (
          <TableCell
            key={headCell.field.toString()}
            align={headCell.inputFieldProps?.type === "number" ? 'right' : 'left'}
            sortDirection={props.orderBy === headCell.field ? props.order : false}
          >
            <TableSortLabel
              active={props.orderBy === headCell.field}
              direction={props.orderBy === headCell.field ? props.order : 'asc'}
              onClick={createSortHandler(headCell.field)}
            >
              {headCell.label}
              {props.orderBy === headCell.field && classes ? (
                <span className={classes.visuallyHidden}>
                  {props.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        {!props.noEdit && props.deleteIcon && (
          <TableCell>

          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );
}

// HeadForm
const useMasterTableHeadFormStyles = makeStyles((theme: Theme) =>
  createStyles({
    wide: {
      width: "100%"
    },
    nopad: {
      padding: "0 " + theme.spacing(1) + "px 0 0"
    },
    leftPadded: {
      "& th:first-child": {
        paddingLeft: theme.spacing(1) + "px"
      }
    }
  }),
);

export function buildHeadersOptions<T extends Models.Identifiable>(headers: HeadCell<T>[], data: T[], values: Optional<T, "id">) {
  return headers.map(header => {
    const type = header.inputFieldProps?.type;
    if (type === "select" || type === "hierarchization") {
      const options = [];
      const prop = header.field;
      // if skimmedBy is used, that means that the options pool is restricted
      // based on the value of one or multiple other fields
      if (header.skimmedBy) {
        // we iterate through all the items to build the options
        for (const item of data) {
          // we respect the contraints given by skimmedBy
          for (const skimVal of header.skimmedBy) {
            const ttt = values[skimVal as keyof Omit<T, "id">];
            // we get the options only if the local value referenced by skimmedBy is provided.
            // if it is the case, we also have to check if the option has the right skimmedBy field value. 
            if (!ttt || item[skimVal] === ttt) {
              const val = item[prop];
              if (val && typeof val === "string" && options.indexOf(val) < 0) {
                options.push(String(val));
              }
              else if (val && Array.isArray(val)) {
                options.push(val.map(e => String(e)));
              }
            }
          }
        }
      }
      // for each filtered item, we build a unique list of value for a given attribute (ex: category)
      else {
        for (const item of data) {
          const val = item[prop];
          if (val && typeof val === "string" && options.indexOf(val) < 0) {
            options.push(String(val));
          }
          else if (val && Array.isArray(val)) {
            options.push(val.map(e => String(e)));
          }
        }
      }

      // we pass the options list to the current header
      // @ts-ignore
      header.options = options;
    }
    return header;
  });
}

interface MasterTableHeadFormProps<T extends Models.Identifiable> {
  headers: HeadCell<T>[]
  data: T[]
  controller: Input.InputProps<Optional<T, "id">>
  checkbox?: boolean
  clearFilters: () => void
  updateItem?: (row: Optional<T, "id">) => void
  createItem?: (row: Optional<T, "id">) => void
  noEdit?: boolean
  onOpenCreateForm?: () => void
}

function MasterTableHeadForm<T extends Models.Identifiable>(props: MasterTableHeadFormProps<T>) {
  const classes = useMasterTableHeadFormStyles();

  // we build the full headers (including options array for select inputs)
  const headers = buildHeadersOptions(props.headers, props.data, props.controller.values);

  const getCustomValue = (header: HeadCell<T>) => {
    if (!header.arrayFormatter) { return; }
    // @ts-ignore
    const items: Models.Item[] = deepCopy(props.controller.values[header.field]);
    return items;
  }

  const handleApplyArrayValue = (header: HeadCell<T>, items: Models.Item[]) => {
    if (!header.arrayFormatter) { return; }
    props.controller.setValues({
      ...props.controller.values,
      [header.field]: items,
    });
  }

  const hOpensCreateItem = () => {
    if (props.onOpenCreateForm) {
      props.onOpenCreateForm();
    }
  }

  return (
    <InputProvider value={props.controller}>
      <TableHead>
        <TableRow className={classes.leftPadded}>
          {props.checkbox && (
            <TableCell padding="checkbox">
              <IconButton size="small" aria-label="clear" onClick={props.clearFilters}>
                <KeyboardReturnIcon />
              </IconButton>
            </TableCell>
          )}
          {headers.map((cell) => (
            <TableCell key={`form-cell-${cell.field}`} className={classes.nopad}>
              <MasterTableHeadField<T>
                header={cell}
                customValue={getCustomValue(cell)}
                onApply={(items) => handleApplyArrayValue(cell, items)}
              />
            </TableCell>
          ))}
          {!props.noEdit && (
            <TableCell className={classes.nopad}>
              {(props.controller.values.id &&
                (props.createItem || props.updateItem)
              ) && (
                  <IconButton
                    size="small"
                    aria-label="edit"
                    onClick={hOpensCreateItem}
                  >
                    <EditIcon />
                  </IconButton>
                )}
              {(!props.controller.values.id &&
                props.createItem
              ) && (
                  <IconButton
                    size="small"
                    aria-label="add"
                    onClick={hOpensCreateItem}
                  >
                    <AddIcon />
                  </IconButton>
                )}
            </TableCell>
          )}
        </TableRow>
      </TableHead>
    </InputProvider>

  );
}

interface MasterTableHeadFieldProps<T extends Models.Identifiable> {
  header: HeadCell<T>
  customValue?: Models.Item[]
  onApply: (values: Models.Item[]) => void
}

export function MasterTableHeadField<T extends Models.Identifiable>(props: MasterTableHeadFieldProps<T>) {

  const [show, setShow] = useState<boolean>(false);
  const header = props.header;

  let defaultValues: Models.Priced = { price: 0 };

  if (header.arrayFormatter) {
    if (header.field === "menus") {
      defaultValues = menusDefaultValues;
    }
    else if (header.field === "plats") {
      defaultValues = platsDefaultValues;
    }
    else if (header.field === "materials") {
      defaultValues = materialsDefaultValues;
    }
    else if (header.field === "drinks") {
      defaultValues = drinksDefaultValues;
    }
  }

  // inititialize controller anyway
  const controller = useInput<Models.Priced>(defaultValues);

  /** TS utility function */
  const getCollection = () => {
    // @ts-ignore
    return controller.values[header.field] as Models.Item[];
  }

  const handleClose = () => {
    setShow(false);
    if (props.customValue) {
      controller.setValues({
        ...controller.values,
        [header.field]: props.customValue,
      });
    }
  }

  const handleAppliquer = () => {
    setShow(false);
    props.onApply(getCollection())
  }

  useEffect(() => {
    if (!header.arrayFormatter) { return; }

    if (props.customValue) {
      controller.setValues({
        ...controller.values,
        [header.field]: props.customValue,
      });
    }
    else {
      controller.reset();
    }
  }, [props.customValue]);

  if (!header.inputFieldProps) {
    return null;
  }

  if (header.arrayFormatter) {
    return (
      <>
        <Button fullWidth variant="outlined" onClick={() => { setShow(true) }}>
          {header.arrayFormatter(getCollection())}
        </Button>
        <Dialog open={show} maxWidth="md" fullWidth onClose={handleClose}>
          <DialogTitle>
            {header.dialogTitle || header.label}
          </DialogTitle>
          <DialogContent>
            <OverviewQuickList
              label={header.dialogTitle}
              selectLabel={header.selectLabel}
              dialogTitle={header.dialogTitle}
              target={header.field as ExpectedTarget}
              controller={controller}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>
              Close
            </Button>
            <Button color="primary" onClick={handleAppliquer}>
              Appliquer
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  const inputFieldProps: InputFieldProps = {
    field: header.field.toString(),
    label: header.label,
    type: header.inputFieldProps?.type,
    size: "fullwidth",
    ...header.inputFieldProps
  }

  if (inputFieldProps.type === "select") {
    return (
      <SearchField
        expandable
        options={header.options || []}
        inputFieldProps={inputFieldProps}
      />
    );
  }
  else if (inputFieldProps.type === "hierarchization") {
    if (header.options) {
      const stringOptions = header.options.map(o0 => {
        return isArray(o0) ? o0.map(o1 => String(o1)) : String(o0);
      });
      inputFieldProps.options = stringOptions as (string[] | string[][]);
    }
  }
  return (
    <InputField {...inputFieldProps} />
  );
}



// Toolbar
const useToolbarStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
    smallToolbar: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
      minHeight: 0
    },
    highlight:
      theme.palette.type === 'light'
        ? {
          color: theme.palette.primary.main,
          backgroundColor: lighten(theme.palette.primary.light, 0.85),
        }
        : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.primary.dark,
        },
    title: {
      flex: '1 1 100%',
      whiteSpace: 'nowrap',
      overflow: "hidden",
      textOverflow: "ellipsis"
    },
    chipsPanel: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: "center",
      gap: theme.spacing(0.5)
    },
    chipsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: "center",
      gap: theme.spacing(0.5),
      marginBottom: theme.spacing(1)
    }
  })
);

interface MasterTableToolbarProps {
  numSelected: number;
  title?: string;
  id?: string;
  noForm?: boolean;
  headerSelection?: boolean;
  toggleEdit: () => void;
  handleSelect: () => void;
  query: string
  onQueryChange?: (value: string) => void
  onOpenCreateForm?: () => void
}

const MasterTableToolbar = (props: MasterTableToolbarProps) => {
  const classes = useToolbarStyles();
  const numSelected = props.headerSelection ? props.numSelected : 0;
  const [showSearch, setShowSearch] = useState<boolean>(false);

  const id = props.id || 'master-table-search-field';

  const toggleSearch = () => {
    if (!showSearch) {
      setTimeout(() => {
        document.getElementById(id)?.focus();
      }, 200);
    }
    if (props.onQueryChange) {
      props.onQueryChange("")
    }
    setShowSearch(!showSearch)
  }

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          {props.title}
        </Typography>
      )}
      {numSelected > 0 && (
        <Tooltip title="Select">
          <IconButton aria-label="select" onClick={props.handleSelect}>
            <CheckIcon />
          </IconButton>
        </Tooltip>
      )}
      <Collapse in={showSearch}>
        <Grid container direction="row-reverse">
          <TextField
            id={id}
            value={props.query}
            onChange={(e) => {
              if (props.onQueryChange) {
                props.onQueryChange(e.target.value)
              }
            }}
            placeholder="Chercher..."
            label=""
          />
        </Grid>
      </Collapse>
      {(
        <Tooltip title="Chercher dans la table">
          <IconButton aria-label="edit list" onClick={toggleSearch}>
            <SearchIcon />
          </IconButton>
        </Tooltip>
      )}
      {numSelected <= 0 && !props.noForm && (
        <Tooltip title="Afficher les filtres">
          <IconButton aria-label="edit list" onClick={props.toggleEdit}>
            <TuneIcon />
          </IconButton>
        </Tooltip>
      )}
      {numSelected <= 0 && !props.noForm && props.onOpenCreateForm && (
        <Tooltip title="Ajouter un élément">
          <IconButton aria-label="edit list" onClick={props.onOpenCreateForm}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

// Filters toolbar
interface FilterChain<T> {
  field: string | number | symbol
  items: FilterChainCell<T>[]
}

interface FilterChainCell<T> {
  field: keyof T
  label: string
  value?: T[keyof T]
  skimmedFor?: keyof T
  options: string[]
}

interface MasterTableFiltersToolbarProps<T extends Models.Identifiable> {
  controller?: Input.InputProps<Optional<T, "id">>
  headers: HeadCell<T>[]
  data: T[]
}

function MasterTableFiltersToolbar<T extends Models.Identifiable>(props: MasterTableFiltersToolbarProps<T>) {
  const classes = useToolbarStyles();

  const headers = props.controller ?
    buildHeadersOptions(props.headers, props.data, props.controller.values) :
    props.headers;

  const getChain = () => {
    let chains: FilterChain<T>[] = [];
    if (props.controller) {
      const values = props.controller.values as T;
      // 1. we look for a hierarchical categorization
      for (const mainHeader of headers) {
        const inputProps = mainHeader.inputFieldProps;
        // we have a hierarchical categorization
        if (inputProps && inputProps.type === "hierarchization") {
          const chain = [];
          // 2. we check if we have skimmedBy values
          let skimmedByDefined = true;
          if (mainHeader.skimmedBy && mainHeader.skimmedBy.length > 0) {
            // we proceed to check all skimmedBy values
            for (let i = 0; i < mainHeader.skimmedBy.length; i++) {
              const skimmedByValue = mainHeader.skimmedBy[i]
              // if we have a skimmedBy not set, we return the matching header options
              let localOptions: string[] = [];
              let label = "";

              for (const h of headers) {
                if (h.field === skimmedByValue) {
                  localOptions = h.options ? h.options.map(o => String(o)) : [];
                  label = h.label;
                }
              }

              // if a value is set, we add a chain cell containing the selected value
              if (!values[skimmedByValue]) {
                skimmedByDefined = false;
                chain.push({
                  field: skimmedByValue,
                  label: label,
                  skimmedFor: mainHeader.field,
                  options: localOptions
                });
              }
              else {
                chain.push({
                  field: skimmedByValue,
                  label: label,
                  value: values[skimmedByValue],
                  skimmedFor: mainHeader.field,
                  options: []
                });
              }
            }
          }

          // we have a skimmed by defined and we can display the list of children
          if (skimmedByDefined) {
            const field = mainHeader.field;
            const selectedValues = values[field];
            const formattedSelectedValues = isArray(selectedValues) ? selectedValues.map(e => String(e)) : [];
            let options: string[] = [];
            if (isArray(selectedValues)) {
              let headerOptions = mainHeader.options;
              if (headerOptions && headerOptions.length > 0) {
                const hierarchyInput = headerOptions.map(o0 => {
                  return isArray(o0) ? o0.map(o1 => String(o1)) : [];
                });
                options = buildHierarchyOptions(hierarchyInput, formattedSelectedValues)
              }
            }
            chain.push({
              field: field,
              label: mainHeader.label,
              value: selectedValues,
              options: options
            })
          }
          chains.push({
            field: mainHeader.field,
            items: chain
          });
        }
      }
    }
    return chains;
  }

  const chains = getChain();

  const selectValue = (cell: FilterChainCell<T>, value: string) => {
    if (props.controller) {
      const field = cell.field as Exclude<keyof T, "id">;
      const values = props.controller.values;
      const currentValue = values[field];
      if (value && isArray(currentValue)) {
        const formattedCurrentValue = isArray(currentValue) ? currentValue.map(e => String(e)) : [];
        formattedCurrentValue.push(value);
        props.controller.setValues({
          ...values,
          [field]: formattedCurrentValue
        })
      }
      else {
        props.controller.setValues({
          ...values,
          [field]: value
        })
      }
    }
  }

  const resetValue = (cell: FilterChainCell<T>) => {
    if (props.controller) {
      const field = cell.field as Exclude<keyof T, "id">;
      let values = props.controller.values;
      const defaultValues = props.controller.getDefaultValues();
      values[field] = defaultValues[field];
      const skimmedFor = cell.skimmedFor as keyof Optional<T, "id">
      if (skimmedFor) {
        values[skimmedFor] = defaultValues[skimmedFor];
      }
      props.controller.setValues(values);
    }
  }

  const removeLastValue = (cell: FilterChainCell<T>, index: number) => {
    if (props.controller) {
      const field = cell.field as Exclude<keyof T, "id">;
      const values = props.controller.values;
      const currentValue = values[field];
      if (index > 0) {
        let formattedCurrentValue = isArray(currentValue) ? currentValue : [];
        formattedCurrentValue.length = index;
        props.controller.setValues({
          ...values,
          [field]: currentValue
        });
      }
      else {
        resetValue(cell);
      }
    }
  }



  return (
    <Toolbar className={classes.smallToolbar}>
      {chains.map(chain => (
        <div className={classes.chipsContainer} key={String(chain.field)}>
          {chain.items.map((cell) => (
            <div className={classes.chipsPanel} key={String(cell.field)}>
              {cell.value && !isArray(cell.value) && (
                <Tooltip title={cell.label}>
                  <Chip
                    onDelete={() => { resetValue(cell) }}
                    label={cell.value}
                    style={{ backgroundColor: "#eee" }}
                  />
                </Tooltip>
              )}
              {cell.value && isArray(cell.value) && cell.value.map((v, i) => (
                <Tooltip key={String(v)} title={`${cell.label} (${(i + 1)})`}>
                  <Chip
                    onDelete={() => { removeLastValue(cell, i) }}
                    label={v}
                    style={{ backgroundColor: "#eee" }}
                  />
                </Tooltip>
              ))}
              {cell.options.length > 0 && (
                <>
                  <ChevronRightIcon htmlColor='#ccc' />
                  {cell.options.map((o, j) => (
                    <Tooltip key={o} title={cell.label}>
                      <Chip
                        clickable
                        label={o}
                        onClick={() => { selectValue(cell, o) }}
                        style={{ backgroundColor: "#eee" }}
                      />
                    </Tooltip>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </Toolbar>
  );
};



// OptionsMenu
interface OptionsMenuProps {
  create?: boolean;
  update?: boolean;
  delete?: boolean;
  handleCreate?: () => void;
  handleUpdate?: () => void;
  handleDelete?: () => void;
}

const OptionsMenu = (props: OptionsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);

  };

  const handleMenuClose = (event: React.MouseEvent<unknown>) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setAnchorEl(null);
  };

  const handleCreate = (event: React.MouseEvent<unknown>) => {
    handleMenuClose(event);
    if (props.handleCreate) {
      props.handleCreate();
    }
  };

  const handleUpdate = (event: React.MouseEvent<unknown>) => {
    handleMenuClose(event);
    if (props.handleUpdate) {
      props.handleUpdate();
    }
  };

  const handleDelete = (event: React.MouseEvent<unknown>) => {
    handleMenuClose(event);
    if (props.handleDelete) {
      props.handleDelete();
    }
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {props.update && <MenuItem onClick={handleUpdate}>Update</MenuItem>}
        {props.create && <MenuItem onClick={handleCreate}>Create</MenuItem>}
        {false && props.delete && <MenuItem onClick={handleDelete}>Delete</MenuItem>}
      </Menu>
    </>
  );
}

// DeleteDialog
interface DeleteDialogProps {
  close: () => void;
  confirm: () => void;
}

export function DeleteDialog(props: DeleteDialogProps) {
  const handleClose = () => {
    props.close();
  };

  return (
    <div>
      <Dialog
        open={true}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            You're about to delete an item. Are you sure ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Disagree
          </Button>
          <Button onClick={() => { props.confirm() }} color="primary">
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

// UpdateDialog
interface UpdateDialogProps<T extends Models.Identifiable> {
  show: boolean
  headers: HeadCell<T>[]
  data: T[]
  controller?: Input.InputProps<Optional<T, "id">>
  title?: string
  onClose: () => void
  onUpdate: (item: Optional<T, "id">) => void
  onCreate: (item: Optional<T, "id">) => void
}

export function UpdateDialog<T extends Models.Identifiable>(props: UpdateDialogProps<T>) {

  const hSave = () => {
    if (props.controller) {
      props.onUpdate(props.controller.values)
    }
  }

  const hCreate = () => {
    if (props.controller) {
      props.onCreate(props.controller.values)
    }
  }

  return (
    <Dialog open={props.show} maxWidth="xl" onClose={props.onClose}>
      {props.controller?.values.id && (
        <DialogTitle>Modification d'un élément de la liste "{props.title}"</DialogTitle>
      )}
      {!props.controller?.values.id && (
        <DialogTitle>Ajouter un élément à liste "{props.title}"</DialogTitle>
      )}
      <DialogContent>
        {!!props.controller && (
          <Grid container spacing={1}>
            <OverviewQuickForm<T>
              data={props.data}
              headers={props.headers}
              controller={props.controller}
            />
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={props.onClose}
        >
          Annuler
        </Button>
        {props.controller?.values.id && (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={hSave}
            >
              Enregistrer
            </Button>
          </>
        )}
        {!props.controller?.values.id && (
          <Button
            variant="contained"
            color="primary"
            onClick={hCreate}
          >
            Ajouter
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}





// Data Cells
interface DataCellProps<T> {
  header: HeadCell<T>
  groupingHeader?: HeadCell<T>
  row: T
  id: string
}

export function DataCell<T>(props: DataCellProps<T>) {

  const { data } = useData();
  const header = props.header;
  const row = props.row;
  const [show, setShow] = useState<boolean>(false);
  const classes = useStyles();
  const toolbalClasses = useToolbarStyles()

  const getLabelFromName = (name: T[keyof T] | string, pool: Data.LabelStatus[]) => {
    return pool.find(l => l.name === name) || {
      name: "",
      color: ""
    };
  }

  if (header.computeValue) {
    return (
      <TableCell align={header.inputFieldProps?.type === "number" ? 'right' : 'left'}>
        {header.computeValue(row)}
      </TableCell>
    )
  }

  if (header.field) {
    let val = row[header.field] as T[keyof T] | string;
    // label dot special case
    if (header.isLabelDot) {
      const statusLabel = getLabelFromName(val, data.config.labelsStatus);
      const labels = (row as (T & { labels: Data.Label[] })).labels;
      return (
        <TableCell padding="checkbox">
          <Tooltip title={statusLabel.name}>
            <div className={classes.sphere} style={{ backgroundColor: statusLabel.color }}></div>
          </Tooltip>
          {labels.length > 0 && (
            <div className={classes.spheresContainer}>
              {labels.map(l => (
                <Tooltip title={l.name} key={l.id}>
                  <div className={classes.subSphere} style={{ backgroundColor: l.color }}></div>
                </Tooltip>
              ))}
            </div>
          )}
        </TableCell>
      )
    }
    // currency formatting
    if (header.currency) {
      val = Number(val).toFixed(2);
    }
    // the value is an array if items
    if (val && Array.isArray(val) && val.length > 0) {
      if (header.inputFieldProps?.type === "hierarchization") {
        return (
          <TableCell>
            <div className={toolbalClasses.chipsPanel}>
              {val.map(v => (
                <Chip
                  key={v}
                  label={v}
                  size="small"
                  style={{ backgroundColor: "#eee" }}
                />
              ))}
            </div>
          </TableCell>
        )
      }
      else if (header.arrayFormatter) {
        return (
          <TableCell align={header.inputFieldProps?.type === "number" ? 'right' : 'left'}>
            <Collapse in={!show}>
              <Button
                disabled={!val.length}
                onClick={(e) => {
                  e.stopPropagation();
                  setShow(true)
                }}
                color="primary"
                className={classes.collapseButton}
                endIcon={<KeyboardArrowDownIcon />}
              >
                {header.arrayFormatter(val)}
              </Button>
            </Collapse>
            <Collapse in={show}>
              <ItemSubTable
                onClick={(e) => {
                  e.stopPropagation();
                  setShow(false)
                }}
                readOnly
                items={val}
                groupingHeader={props.groupingHeader}
              />
            </Collapse>
          </TableCell>
        )
      }
    }
    return (
      <TableCell align={header.inputFieldProps?.type === "number" ? 'right' : 'left'}>
        {val}
      </TableCell>
    )
  }

  return (<TableCell></TableCell>);
}





// MasterTable
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    table: {
      //minWidth: 750, Commented out for the moment -> better display on menu.tsx
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
    tableRowClickable: {
      cursor: "pointer",
      "&.Mui-selected, &.Mui-selected:hover": {
        backgroundColor: theme.palette.action.selected,
        "& > .MuiTableCell-root": {
          color: "inherit"
        }
      }
    },
    tableRow: {
      "&.Mui-selected, &.Mui-selected:hover": {
        backgroundColor: blue[100],
        "& > .MuiTableCell-root": {
          color: "inherit"
        }
      }
    },
    collapseButton: {
      textTransform: "none"
    },
    sphere: {
      height: theme.spacing(3),
      width: theme.spacing(3),
      borderRadius: "50%",
      display: "inline-block",
      verticalAlign: "middle"
    },
    subSphere: {
      height: theme.spacing(1.5),
      width: theme.spacing(1.5),
      display: "inline-block",
      borderRadius: "50%",
    },
    spheresContainer: {
      display: "flex",
      flexWrap: "wrap",
      marginBottom: "2px"
    }
  })
);

interface MasterTableProps<T extends Models.Identifiable> {
  deleteItem?: (row: Optional<T, "id">) => void
  updateItem?: (row: Optional<T, "id">) => void
  createItem?: (row: Optional<T, "id">) => void
  onSelectItems?: (items: T[]) => void
  onSelectionChange?: (items: T[]) => void
  selected?: string[]
  onRowClick?: (row: T) => void
  data: T[]
  headers: HeadCell<T>[]
  title?: string
  id?: string
  controller?: Input.InputProps<Optional<T, "id">>
  checkbox?: boolean
  noEdit?: boolean
}

export default function MasterTable<T extends Models.Identifiable>(props: MasterTableProps<T>) {

  const classes = useStyles();
  const { generateToast } = useToast();

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof T>('id');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [edit, setEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [query, setQuery] = useState("");


  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function customDescComparator<T>(a: T, b: T, compute: (e: T) => string) {
    if (compute(b) < compute(a)) {
      return -1;
    }
    if (compute(b) > compute(a)) {
      return 1;
    }
    return 0;
  }

  const getCustomComputation = (orderBy: keyof T) => {
    for (const h of props.headers) {
      if (h.field === orderBy && h.computeValue && !h.compareUsingRaw) {
        return h.computeValue;
      }
    }
    return null;
  }

  function getComparator(
    order: 'asc' | 'desc',
    orderBy: keyof T,
  ): (a: T, b: T) => number {
    const computeValue = getCustomComputation(orderBy);
    if (computeValue) {
      return order === 'desc'
        ? (a, b) => customDescComparator(a, b, computeValue)
        : (a, b) => -customDescComparator(a, b, computeValue);
    }
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  function getCellValue(row: T, prop: keyof T): any {
    if (prop) {
      const customValue = getCustomComputation(prop);
      if (!!customValue) {
        return String(customValue(row))
      }
      return row[prop];
    }
    return "";
  }


  // rows filtering
  let rows = props.data;
  if (props.headers) {
    rows = rows.filter(row => {
      // we check if any of the filters has been declared
      let test = true;
      for (const header of props.headers) {
        // the field name
        const prop = header.field;

        if (header.arrayFormatter) {

          let queryElements: Models.Identifiable[] = [];
          if (props.controller && prop !== "id") {
            // @ts-ignore
            const items = props.controller.values[prop];
            queryElements = items;
          }

          const valueElements: Models.Identifiable[] = row[prop] as any;

          const queryIds = queryElements.map(e => e.id);
          const valueIds = valueElements.map(e => e.id);

          let conform = true;
          // each elements of the query
          for (const qId of queryIds) {
            // must be similar to at least one elements of the value
            let found = false;
            for (const vId of valueIds) {
              if (vId === qId) {
                found = true;
              }
            }
            conform = conform && found;
          }

          test = test && conform;
        }
        else {
          // the value in the row cell
          let val = getCellValue(row, prop);
          if (val) {
            // the value used to filter
            let q = props.controller && props.controller.values[prop as keyof Optional<T, "id">] ?
              String(props.controller.values[prop as keyof Optional<T, "id">]).toLowerCase() :
              "";

            // we test the value based on its type
            if (q) {
              if (header.inputFieldProps?.type === "number" && q.length > 0) {
                // for the numbers, we check if the first character of the query is '>' or '<'
                if (q[0] === ">") {
                  test = test && parseFloat(val) > parseFloat(q.substring(1));
                }
                else if (q[0] === "<") {
                  test = test && parseFloat(val) < parseFloat(q.substring(1));
                }
                else if (q != "0") {
                  test = test && val == q
                }
              }
              else if (isArray(val)) {
                // for array of string (mostly hierarchization), we compare the comma-separated string values
                test = test && (val.join(',') === q);
              }
              else {
                // for the string, we check if the cell value contains the normalized substring used as filter
                val = String(val).toLowerCase()
                test = test && val.includes(q);
              }
            }
          }
        }
      }

      // for the rows that have been kept and if a query has been entered,
      // we check if the row is also matching the global query
      if (test && query) {
        const queryChunks = query.split(' ');
        let testChunks = queryChunks.map(() => false)
        // for each column of data (table cell)
        for (const header of props.headers) {
          // the value in the row cell
          const val = getCellValue(row, header.field);
          // if the cell has a value
          if (val) {
            let valueChunks = [];
            // if the value is an array
            if (isArray(val) && val.length > 0) {
              // when the array contains strings
              if (typeof val[0] === "string") {
                valueChunks = val.map(e => e.split(' ')).flat();
              }
              // when the array contains objects
              else if ((val[0] || {}).name) {
                valueChunks = val.map(e => e.name.split(' ')).flat();
              }
            }
            // if the value is a string
            else if (typeof val === "string") {
              valueChunks = val.split(' ');
            }
            // we check all the row values
            for (const vc of valueChunks) {
              // each of the query chunks have to be present at least once in a cell
              for (let i = 0; i < queryChunks.length; i++) {
                const qc = queryChunks[i];
                if (vc.toLowerCase().includes(qc.toLowerCase())) {
                  testChunks[i] = true;
                }
              }
            }
          }
        }
        // we check if all the query chunks are contained in the row values
        test = testChunks.reduce((v, a) => a && v, true)
      }

      // otherwise, we return the item
      return test;
    });
  }

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (rows && event.target.checked && rows.length > 0 && 'id' in rows[0]) {
      const newSelecteds = rows.map((n) => n.id);
      if (newSelecteds) {
        setSelected(newSelecteds);
      }
      if (props.onSelectionChange) {
        props.onSelectionChange(rows);
      }
      return;
    }
    setSelected([]);
    if (props.onSelectionChange) {
      props.onSelectionChange([]);
    }
  };

  const handleClick = (event: React.MouseEvent<unknown>, row: T) => {
    console.log(row.id, row);
    if (!!props.onRowClick) {
      props.onRowClick(row);
    }
    if (props.checkbox) {
      const id = row.id;
      const selectedIndex = selected.indexOf(id.toString());
      let newSelected: string[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id.toString());
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1),
        );
      }
      setSelected(newSelected);

      if (props.onSelectionChange) {
        props.onSelectionChange(props.data.filter(e => newSelected.indexOf(e.id) >= 0));
      }
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleEdit = () => {
    setEdit(!edit);
    if (props.controller) {
      props.controller.reset();
    }
  }

  const isSelected = (id: string) => {
    let test = false;
    if (props.selected && props.selected.length > 0) {
      test = props.selected.indexOf(id) !== -1
    }
    return test || selected.indexOf(id) !== -1
  };

  const openUpdateForm = (row: T) => {
    if (props.controller) {
      props.controller.setValues(row);
      setShowUpdateDialog(true);
    }
  }

  const openDeleteConfirm = (row: T) => {
    if (props.controller) {
      props.controller.setValues(row);
    }
    setShowDelete(true);
  }

  const closeDeleteConfirm = () => {
    if (props.controller) {
      props.controller.reset();
    }
    setShowDelete(false);
  }

  const handleCreate = (row: Optional<T, "id">) => {
    if (props.controller) {
      const validationParams = { mode: "add", id: props.controller.values.id, data: props.data };
      if (props.controller.validate(validationParams)) {
        if (props.createItem) {
          props.createItem(row);
        }
        props.controller.reset();
      }
    }
  }

  const handleDialogCreate = (row: Optional<T, "id">) => {
    if (props.controller) {
      const validationParams = { mode: "add", id: props.controller.values.id, data: props.data };
      if (props.controller.validate(validationParams)) {
        if (props.createItem) {
          props.createItem(row);
        }
        props.controller.reset();
        setShowUpdateDialog(false);
      }
      else {
        generateToast("Inputs validation failed.", "error");
      }
    }
  }

  const handleUpdate = (row: Optional<T, "id">) => {
    if (props.controller) {
      const validationParams = { mode: "modify", id: props.controller.values.id, data: props.data };
      if (props.controller.validate(validationParams)) {
        if (props.updateItem) {
          props.updateItem(row);
        }
        props.controller.reset();
      }
    }
  }

  const handleDialogUpdate = (row: Optional<T, "id">) => {
    if (props.controller) {
      const validationParams = { mode: "modify", id: props.controller.values.id, data: props.data };
      if (props.controller.validate(validationParams)) {
        if (props.updateItem) {
          props.updateItem(row);
        }
        props.controller.reset();
        setShowUpdateDialog(false);
      }
      else {
        generateToast("Inputs validation failed.", "error");
      }
    }
  }

  const handleDelete = (row: Optional<T, "id">) => {
    setShowDelete(false);
    if (props.deleteItem) {
      props.deleteItem(row);
      if (props.controller) {
        props.controller.reset();
      }
    }
  }

  const clearFilters = () => {
    if (props.controller) {
      props.controller.reset()
    }
  }

  const handleSelect = () => {
    if (props.onSelectItems) {
      const selection = props.data.filter(e => selected.indexOf(e.id) >= 0);
      props.onSelectItems(selection);
    }
  }

  const handleQueryChange = (val: string) => {
    setQuery(val)
  }


  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const handleUpdateDialogClose = () => {
    setShowUpdateDialog(false)
  }

  const handleOpenCreateForm = () => {
    if (props.controller) {
      const values = props.controller.values as T;
      openUpdateForm(values);
    }
  }

  function getGroupingHeader<T>(header: HeadCell<T>): HeadCell<T> | undefined {
    if (header.arrayFormatter) {
      if (header.field === "menus") {
        return menusParams.find(e => !!e.groupsConfig) as HeadCell<T> | undefined
      }
      if (header.field === "plats") {
        return platsParams.find(e => !!e.groupsConfig) as HeadCell<T> | undefined
      }
      if (header.field === "materials") {
        return materialParams.find(e => !!e.groupsConfig) as HeadCell<T> | undefined
      }
      if (header.field === "drinks") {
        return drinksParams.find(e => !!e.groupsConfig) as HeadCell<T> | undefined
      }
    }
    return undefined;
  }

  return (
    <div className={classes.root}>
      {props.controller && showDelete && (
        <DeleteDialog
          close={closeDeleteConfirm}
          confirm={() => {
            if (props.controller) {
              handleDelete(props.controller.values)
            }
          }}
        />
      )}
      <MasterTableToolbar
        id={props.id}
        headerSelection={!props.onSelectionChange}
        noForm={!props.controller}
        numSelected={selected.length}
        title={props.title}
        toggleEdit={toggleEdit}
        handleSelect={handleSelect}
        query={query}
        onQueryChange={handleQueryChange}
        onOpenCreateForm={handleOpenCreateForm}
      />
      <MasterTableFiltersToolbar
        headers={props.headers}
        data={props.data}
        controller={props.controller}
      />
      <TableContainer>
        <Table
          className={classes.table}
          aria-labelledby="tableTitle"
          size="small"
          aria-label="enhanced table"
        >
          {edit && props.controller && (
            <MasterTableHeadForm
              headers={props.headers}
              data={props.data}
              controller={props.controller}
              clearFilters={clearFilters}
              updateItem={props.updateItem ? handleUpdate : undefined}
              createItem={props.createItem ? handleCreate : undefined}
              checkbox={props.checkbox}
              noEdit={props.noEdit}
              onOpenCreateForm={handleOpenCreateForm}
            />
          )}
          {orderBy !== undefined && (
            <MasterTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
              headers={props.headers}
              deleteIcon={edit}
              checkbox={props.checkbox}
              noEdit={props.noEdit}
            />
          )}
          <TableBody>
            {rows && stableSort(rows, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;
                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    className={!!props.onRowClick ? classes.tableRowClickable : classes.tableRow}
                  >
                    {props.checkbox && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                    )}
                    {props.headers.map((header, i) => (
                      <DataCell<T>
                        header={header}
                        groupingHeader={getGroupingHeader(header)}
                        row={row}
                        key={`${row.id}-${i}`}
                        id={`${row.id}-${i}`}
                      />
                    ))}
                    {!props.noEdit && edit && (
                      <TableCell padding="none">
                        {(props.createItem || props.updateItem) &&
                          <OptionsMenu
                            update={!!props.updateItem}
                            delete={!!props.deleteItem}
                            handleUpdate={() => { openUpdateForm(row) }}
                            handleDelete={() => { openDeleteConfirm(row) }}
                          />
                        }
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 15, 25, 50, 100, 300, 500]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
      <UpdateDialog
        show={showUpdateDialog}
        headers={props.headers}
        data={props.data}
        title={props.title}
        controller={props.controller}
        onClose={handleUpdateDialogClose}
        onUpdate={handleDialogUpdate}
        onCreate={handleDialogCreate}
      />
    </div>
  );
}


