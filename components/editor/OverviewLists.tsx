// react
import { ChangeEvent, FC, MouseEvent, MouseEventHandler, useEffect, useState } from 'react';

// firebase
import { deepCopy } from '@firebase/util';

// mui
import { createFilterOptions, Autocomplete } from '@material-ui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  makeStyles,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
  withStyles
} from '@material-ui/core';
import MuiTextField from '@material-ui/core/TextField';
import RemoveIcon from '@material-ui/icons/Remove';
import TocIcon from '@material-ui/icons/Toc';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SettingsIcon from '@material-ui/icons/Settings';

// utils
import { Data, Inputs, Models, Optional } from '../../utils/types';
import { Input, InputProvider, useInput } from '../../utils/Input';
import { drinksParams, HeadCell, materialParams, menusParams, platsParams } from '../../utils/MasterTableParams';
import { addItemToPool, formatPrice, pop } from '../../utils/Helper';
import {
  drinkDefaultValues,
  drinksDefaultValues,
  materialDefaultValues,
  materialsDefaultValues,
  menuDefaultValues,
  menusDefaultValues,
  platDefaultValues,
  platsDefaultValues
} from '../../utils/defaultValues';

// hooks
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';

// components
import MasterTable, { buildHeadersOptions } from '../MasterTable';
import OverviewQuickForm from './OverviewQuickForm';



const TextField = withStyles((theme) => ({
  root: {
    padding: 0
  }
}))(MuiTextField);

const MiniTextField = withStyles((theme) => ({

}))(MuiTextField);

const useStyles = makeStyles((theme) => ({
  mainCell: {
    padding: theme.spacing(0, 0, 1, 1)
  },
  menuHeader: {
    borderBottom: "2px solid " + theme.palette.primary.main,
    margin: theme.spacing(1, 0, 0.5, 0),
    display: "flex",
    alignItems: "center"
  },
  smallMenuHeader: {
    borderBottom: "1px solid transparent",
    display: "flex",
    alignItems: "center",
    width: "100%"
  },
  dishesTable: {
    width: "100%",
    listStyleType: "none",
    margin: 0,
    padding: theme.spacing(1, 0, 1, 1),
    verticalAlign: "top"
  },
  dishesTableNum: {
    verticalAlign: "top",
    padding: theme.spacing(0, 0, 0, 2),
    width: theme.spacing(4)
  },
  dishesTableText: {
    fontSize: "0.8rem",
    padding: theme.spacing(0)
  },
  dishesTablePrice: {
    verticalAlign: "middle",
    paddingLeft: theme.spacing(2),
    textAlign: "right"
  },
  dishesTableDelete: {
    maxWidth: theme.spacing(4),
    padding: 0,
    textAlign: "right"
  },
  inputNum: {
    width: "3rem"
  },
  smallInputNum: {
    width: "3rem"
  },
  menuTitle: {
    flex: "1",
    margin: theme.spacing(0, 1)
  },
  smallMenuTitle: {
    fontSize: "0.8rem",
    flex: 1,
    margin: theme.spacing(0, 1)
  },
  menuDeleteIcon: {
    fontSize: "1.25rem",
  },
  mainPrice: {
    color: theme.palette.text.secondary,
    fontSize: "1rem",
    marginRight: theme.spacing(1)
  },
  smallMainPrice: {
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1)
  },
  smallTextLighter: {
    color: theme.palette.text.secondary,
    fontSize: "0.8rem"
  },
  smallText: {
    fontSize: "0.8rem"
  },
  deleteIcon: {
    margin: theme.spacing(2, 0, 0, 0)
  },
  totalLane: {
    display: "flex",
    flexDirection: "row-reverse",
    marginTop: theme.spacing(1),
    gap: theme.spacing(1)
  },
  quantityInputCell: {
    verticalAlign: "top"
  },
  totalLaneInput: {
    width: 200
  },
  itemSelectorSelect: {
    flex: 1
  },
  transferIcon: {
    marginRight: theme.spacing(1)
  },
  wideTable: {
    width: "100%"
  },
  formattedDialogTitle: {
    textTransform: "capitalize"
  }
}));




// Item line

interface ItemLineProps<T extends Models.Quantified> {
  item: T
  useHeading?: boolean
  target: string
  price?: number
  onQuantityChange: (quantity: number) => void
  onDelete?: MouseEventHandler<HTMLButtonElement> | undefined
  readOnly?: boolean
  transferMode?: boolean
  onTransfer: (item: T) => void
  onOpenOptions?: () => void
}

function ItemLine<T extends Models.Item>(props: ItemLineProps<T>) {

  const classes = useStyles();

  const hQuantityChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = Number(e.target.value) || 1; // ensure that the minimal quantity is 1
    props.onQuantityChange(val);
  }

  const hKeyUp = (e: { code: string; }) => {
    if (e.code === "Enter") {
      // focus on the main input from a number (quantity) input
      document.getElementById(`${props.target}-select`)?.focus()
    }
  }

  return (
    <Grid item className={props.useHeading ? classes.menuHeader : classes.smallMenuHeader}>
      {props.transferMode && (
        <IconButton
          className={classes.transferIcon}
          size="small"
          color="primary"
          aria-label="transfer"
          onClick={() => { props.onTransfer(props.item) }}
        >
          <ArrowBackIcon />
        </IconButton>
      )}
      <TextField
        disabled={props.readOnly}
        id={`item-quantity${props.item.id}`}
        className={props.useHeading ? classes.inputNum : classes.smallInputNum}
        size="small"
        type="number"
        value={props.item.quantity}
        onChange={hQuantityChange}
        onKeyUp={hKeyUp}
        InputProps={{
          margin: 'none',
          disableUnderline: true,
          inputProps: {
            min: 1,
          }
        }}
      />
      {!props.readOnly && props.onOpenOptions && (
        <IconButton size="small" aria-label="delete" onClick={props.onOpenOptions}>
          <SettingsIcon color="primary" className={classes.menuDeleteIcon} />
        </IconButton>
      )}
      <Typography className={props.useHeading ? classes.menuTitle : classes.smallMenuTitle}>{props.item.name === "_NO_NAME_" ? "" : props.item.name}</Typography>
      <Tooltip title={`Total: ${formatPrice(props.price)}`} placement='top' arrow>
        <Typography className={props.useHeading ? classes.mainPrice : classes.smallMainPrice}>{formatPrice(props.item.price)} <sup><small>pp</small></sup></Typography>
      </Tooltip>
      {!props.readOnly && (
        <IconButton size="small" aria-label="delete" onClick={props.onDelete}>
          <RemoveIcon color="error" className={classes.menuDeleteIcon} />
        </IconButton>
      )}
    </Grid>
  );
}

// Menu line

interface MenuLineProps {
  menu: Data.Menu & Models.Quantified
  onUpdate?: (quantity: Data.Menu & Models.Quantified) => void
  onDelete?: MouseEventHandler<HTMLButtonElement> | undefined
  readOnly?: boolean
  transferMode?: boolean
  onTransfer: (item: Data.Menu & Models.Quantified) => void
}

const MenuLine: FC<MenuLineProps> = (props) => {

  const { data, update } = useData();
  const { generateToast } = useToast();
  const classes = useStyles();
  const [showAddTable, setShowAddTable] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [selectionPlat, setSelectionPlat] = useState<Data.Plat[]>([]);
  const [menuDishes, setMenuDishes] = useState<(Data.Plat & Models.Editable & Models.Quantified)[]>([]);
  const menu = {
    ...props.menu,
    name: props.menu.name === "_NO_NAME_" ? "(Plats hors menu)" : props.menu.name
  }

  const menuController = useInput<Optional<Data.Menu, "id">>(menu);

  const categoryHeader = platsParams.find(e => e.field === "category");

  useEffect(() => {
    setMenuDishes(deepCopy(props.menu.plats));
    menuController.setValues(props.menu)
  }, [props.menu])

  const hQuantityChange = (quantity: number) => {
    if (props.onUpdate) {
      let item = props.menu;
      item.quantity = quantity;
      props.onUpdate(item);
    }
  }

  const hSubItemsChange = (items: (Data.Plat & Models.Quantified)[]) => {
    if (props.onUpdate) {
      let item = props.menu;
      item.plats = items;
      item.price = items.reduce((p, v) => p + v.price * (v.quantity || 1), 0)
      props.onUpdate(item);
    }
  }

  const hSubItemsCategorySelect = (value: string) => {
    setShowAddTable(true);
    const selection = data.plats.filter(plat => plat.category === value);
    setSelectionPlat(selection);
  }

  const selectDish = (plat: Data.Plat | null) => {
    if (plat) {
      let menu = props.menu;
      menu.plats = addItemToPool(menu.plats, plat);
      menu.price = menu.plats.reduce((p, v) => p + v.price * (v.quantity || 1), 0);
      if (props.onUpdate) {
        props.onUpdate(menu);
      }
    }
    setShowAddTable(false)
    // deep copy to trigger the ItemSubTable useEffect
    setMenuDishes(deepCopy(props.menu.plats));
  }

  const selectMultipleMenusDishes = (plats: Data.Plat[]) => {
    if (plats.length > 0) {
      let menu = props.menu;
      for (const plat of plats) {
        menu.plats = addItemToPool(menu.plats, plat);
      }
      menu.price = menu.plats.reduce((p, v) => p + v.price * (v.quantity || 1), 0);
      if (props.onUpdate) {
        props.onUpdate(menu);
      }
    }
    setShowAddTable(false)
    // deep copy to trigger the ItemSubTable useEffect
    setMenuDishes(deepCopy(props.menu.plats));
  }

  const openForm = () => {
    setShowSaveForm(true);
  }

  const closeForm = () => {
    setShowSaveForm(false);
    menuController.reset();
  }

  const handleLocalSave = () => {
    if (props.onUpdate) {
      const item = {
        ...props.menu,
        ...menuController.values
      };
      props.onUpdate(item);
      setShowSaveForm(false);
    }
  }

  const handleAddToList = () => {
    update({ menus: [pop(menuController.values, "id")] });
    generateToast("Menu saved.", "success");
  }

  return (
    <>
      <div className={classes.mainCell}>
        <ItemLine
          readOnly={props.readOnly}
          target="menu"
          useHeading
          item={menu}
          onDelete={props.onDelete}
          price={menu.price * menu.quantity}
          onQuantityChange={hQuantityChange}
          transferMode={props.transferMode}
          onTransfer={props.onTransfer}
          onOpenOptions={openForm}
        />
        <ItemSubTable<Data.Plat>
          groupingHeader={categoryHeader}
          readOnly={props.readOnly}
          items={menuDishes}
          onItemsChange={hSubItemsChange}
          onCategorySelect={hSubItemsCategorySelect}
        />
      </div>

      <Dialog open={showAddTable} maxWidth="md" fullWidth onClose={() => { setShowAddTable(false) }}>
        <DialogTitle>Ajouter un plat au menu</DialogTitle>
        <DialogContent>
          <ItemSelector<Data.Plat>
            target="plats"
            selectId="menu-select-dish"
            disabled={props.readOnly}
            title="Plats"
            options={selectionPlat}
            onChange={selectDish}
            onSelect={selectMultipleMenusDishes}
            selectLabel='Sélectionnez un plat'
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => { setShowAddTable(false) }}
          >
            Annuler
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showSaveForm} maxWidth="md" fullWidth onClose={closeForm}>
        <DialogTitle>Save form</DialogTitle>
        <DialogContent>
          <OverviewQuickForm
            data={data.menus}
            headers={menusParams}
            controller={menuController}
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="outlined"
            onClick={handleAddToList}
          >
            Ajouter à la liste
          </Button>
          <Button
            variant="contained"
            onClick={closeForm}
          >
            Annuler
          </Button>
          {props.onUpdate && (
            <Button
              color="primary"
              variant="contained"
              onClick={handleLocalSave}
            >
              Modifier dans l'évènement
            </Button>
          )}

        </DialogActions>
      </Dialog>
    </>
  );
}

// SubTable

interface CategorizedItem<T> {
  name: string
  items: (T & Models.Editable & Models.Quantified & { _index: number })[]
}

interface ItemSubTableProps<T> {
  items: Array<T & Models.Editable & Models.Quantified>
  readOnly?: boolean
  groupingHeader?: HeadCell<T>
  onClick?: (e: MouseEvent<HTMLTableElement, globalThis.MouseEvent>) => void
  onItemsChange?: (items: (T & Models.Quantified)[]) => void
  onCategorySelect?: (value: string) => void
}

export function ItemSubTable<T>(props: ItemSubTableProps<T>) {

  const classes = useStyles();
  const { data } = useData();
  const [categorizedItems, setCategoriesArray] = useState<CategorizedItem<T>[]>([]);

  useEffect(() => {
    categorizeItems()
  }, [props.items])

  const categorizeItems = () => {
    const h = props.groupingHeader;
    if (h?.groupsConfig) {
      const config = data.config;
      const categoriesArray = (config[h.groupsConfig] || []) as string[];
      let pool: CategorizedItem<T>[] = categoriesArray.map(e => ({
        name: e,
        items: []
      }));
      pool.push({
        name: "", // uncategorized
        items: []
      });

      // we add _index to keep the original index value after the category sorting
      const items = props.items.map((e, i) => ({ ...e, _index: i }));
      // we place the items in the right category
      for (const item of items) {
        const field = String(item[h.field]);
        const poolIndex = categoriesArray.indexOf(field);
        if (poolIndex >= 0) {
          pool[poolIndex].items.push(item);
        }
        else {
          pool[pool.length - 1].items.push(item);
        }
      }

      // if we have no uncategorized items, we remove the category
      setCategoriesArray(pool);
    }
  }

  const handleOnClick = (e: MouseEvent<HTMLTableElement, globalThis.MouseEvent>) => {
    if (props.onClick) {
      props.onClick(e);
    }
  }

  const hQuantityChange = (index: number, quantity: number) => {
    if (props.onItemsChange) {
      let item = props.items[index];
      item.quantity = quantity || 1;
      let items = props.items;
      items.splice(index, 1, item);
      props.onItemsChange(items);
      categorizeItems();
    }
  }

  const hRemoveDish = (index: number) => {
    if (props.onItemsChange) {
      let items = props.items;
      items.splice(index, 1);
      props.onItemsChange(items);
      categorizeItems();
    }
  }

  const hTitleClick = (e: (T & Models.Editable & Models.Quantified)) => {
    console.log(e.id, e);
  }

  const selectCategory = (index: number) => {
    if (props.onCategorySelect) {
      props.onCategorySelect(categorizedItems[index].name)
    }
  }

  return (
    <Grid container spacing={1} onClick={(e: MouseEvent<HTMLTableElement, globalThis.MouseEvent>) => { handleOnClick(e) }}>
      {categorizedItems.length > 0 && categorizedItems.map((bloc, categoryIndex) => (
        <Grid
          item
          key={bloc.name}
          className={bloc.items.length > 0 ? classes.wideTable : ''}
        >
          {props.readOnly && bloc.items.length > 0 && (
            <Typography
              color="textSecondary"
              variant="button"
            >
              {bloc.name || "Non catégorisé"}
            </Typography>
          )}
          {!props.readOnly && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              disabled={props.readOnly}
              onClick={() => { selectCategory(categoryIndex) }}
            >
              {bloc.name || "Non catégorisé"}
            </Button>
          )}
          <TableContainer
            component={Paper}
            onClick={(e: MouseEvent<HTMLTableElement, globalThis.MouseEvent>) => { handleOnClick(e) }}
          >
            <Table className={classes.dishesTable} size="small" aria-label="items table">
              <TableBody>
                {bloc.items?.map((item, i) => (
                  <TableRow key={item.id}>
                    <TableCell className={classes.dishesTableNum}>
                      <MiniTextField
                        disabled={props.readOnly}
                        className={classes.smallInputNum}
                        size="small"
                        type="number"
                        value={item.quantity}
                        onChange={(event) => { hQuantityChange(item._index || i, Number(event.target.value)) }}
                        InputProps={{
                          margin: 'none',
                          disableUnderline: true,
                          inputProps: {
                            min: 1,
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className={classes.dishesTableText} onClick={() => { hTitleClick(item) }}>
                      <Typography className={classes.smallText}>{item.name}</Typography>
                    </TableCell>
                    <TableCell className={classes.dishesTablePrice}>
                      <Typography className={classes.smallTextLighter}>{formatPrice(item.price * (item.quantity || 1))}</Typography>
                    </TableCell>
                    {!props.readOnly && (
                      <TableCell className={classes.dishesTableDelete}>
                        <IconButton size="small" aria-label="delete" onClick={() => { hRemoveDish(item._index || i) }}>
                          <RemoveIcon color="error" className={classes.menuDeleteIcon} />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      ))}
      {!categorizedItems.length && (
        <TableContainer
          component={Paper}
        >
          <Table className={classes.dishesTable} size="small" aria-label="items table">
            <TableBody>
              {props.items?.map((item, i) => (
                <TableRow key={item.id}>
                  <TableCell className={classes.dishesTableNum}>
                    <MiniTextField
                      disabled={props.readOnly}
                      className={classes.smallInputNum}
                      size="small"
                      type="number"
                      value={item.quantity}
                      onChange={(item) => { hQuantityChange(i, Number(item.target.value)) }}
                      InputProps={{
                        margin: 'none',
                        disableUnderline: true,
                        inputProps: {
                          min: 1,
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className={classes.dishesTableText} onClick={() => { hTitleClick(item) }}>
                    <Typography className={classes.smallText}>{item.name}</Typography>
                  </TableCell>
                  <TableCell className={classes.dishesTablePrice}>
                    <Typography className={classes.smallTextLighter}>{formatPrice(item.price * (item.quantity || 1))}</Typography>
                  </TableCell>
                  {!props.readOnly && (
                    <TableCell className={classes.dishesTableDelete}>
                      <IconButton size="small" aria-label="delete" onClick={() => { hRemoveDish(i) }}>
                        <RemoveIcon color="error" className={classes.menuDeleteIcon} />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Grid>
  );
}

// Total lane

interface TotalLaneProps<T> {
  id?: string
  value?: number
  readOnly?: boolean
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function TotalLane<T>(props: TotalLaneProps<T>) {

  const classes = useStyles();

  return (
    <Grid
      style={{ marginTop: 10 }}
      container
      direction="row-reverse"
    >
      <Grid item>
        <TextField
          className={classes.totalLaneInput}
          id={props.id}
          type="number"
          size="small"
          variant="outlined"
          value={formatPrice(props.value)}
          onChange={props.onChange}
          InputProps={{
            readOnly: props.readOnly,
            startAdornment: <InputAdornment position="start">Total: </InputAdornment>,
            endAdornment: <InputAdornment position="end">CHF</InputAdornment>,
            inputProps: {
              min: 0,
            }
          }}
        />
      </Grid>
    </Grid>
  );
}



// Selector

const filter = createFilterOptions<any>();

interface ItemSelectorProps<T extends Models.Unique> {
  title?: string
  onSelect: (items: T[]) => void
  controller?: Input.InputProps<Optional<T, "id">>
  selectLabel?: string
  dialogTitle?: string
  selectId?: string
  onChange: (value: T) => void
  options?: T[]
  disabled?: boolean
  headers?: HeadCell<T>[]
  target?: string
}

export function ItemSelector<T extends Models.Unique>(props: ItemSelectorProps<T>) {

  const { data, update } = useData();
  const { generateToast } = useToast();
  const [showTable, setShowTable] = useState<boolean>(false);
  const [showAddNew, setShowAddNew] = useState<boolean>(false);
  const [localSelection, setLocalSelection] = useState<T[]>([]);
  const [displayedValue, setDisplayedValue] = useState<string>("");
  const [localValue] = useState<string>("");

  let controller: Input.InputProps<Optional<Models.Unique, "id">>;
  let defaultValues: Optional<Models.Unique, "id"> = { name: "" };
  let options: Models.Unique[] = props.options || [];
  let headers: HeadCell<Models.Unique>[] = [];

  if (props.target === "menus") {
    defaultValues = menuDefaultValues;
    headers = menusParams as any;
    if (!options.length) {
      options = data.menus;
    }
  }
  else if (props.target === "plats") {
    defaultValues = platDefaultValues;
    headers = platsParams as any;
    if (!options.length) {
      options = data.plats;
    }
  }
  else if (props.target === "materials") {
    defaultValues = materialDefaultValues;
    headers = materialParams as any;
    if (!options.length) {
      options = data.materials;
    }
  }
  else if (props.target === "drinks") {
    defaultValues = drinkDefaultValues;
    headers = drinksParams as any;
    if (!options.length) {
      options = data.drinks;
    }
  }
  // inititialize controller anyway
  controller = useInput(defaultValues);

  // building the headers options
  headers = buildHeadersOptions(headers, options, controller.values);

  // if given in props -> replace it by given one
  if (props.controller && props.options && props.headers) {
    controller = props.controller as Input.InputProps<Optional<Models.Unique, "id">>;
    options = props.options;
    headers = props.headers as any;
  }

  const selectMultiple = () => {
    props.onSelect(localSelection);
    setShowTable(false);
  }

  const handleAddNew = (name: string) => {
    controller.setValues({
      ...controller.values,
      name,
    });
    setShowAddNew(true);
    setTimeout(() => {
      // selecting the 'name' field in the QuickForm
      document.getElementById('name')?.focus();
    }, 50);
  }

  const addNewItemToList = () => {
    const validationParams = { mode: "add", id: controller.values.id, data: options };
    if (!controller.validate(validationParams)) {
      generateToast("Inputs validation failed.", "error");
      return;
    }

    if (props.target) {
      update({ [props.target]: [controller.values] });
      generateToast("Item created.", "success");
    }
  }

  const getOptionLabel = (item: Optional<Models.Unique, "id">) => {
    if (item) {
      if (typeof item === "string") {
        return item;
      }
      else {
        return item.name;
      }
    }
    return "";
  }

  const handleSelectionChange = (items: Models.Unique[]) => {
    setLocalSelection(items as T[]);
  }

  const handleChange = (event: ChangeEvent<{}>, value: string | Models.Unique | null) => {
    if (!value) { return; }

    if (typeof value === "string") {
      handleAddNew(value);
    } else if (!value.id) {
      handleAddNew(displayedValue);
    } else if (value.id) {
      setDisplayedValue("");
      props.onChange(value as T);
    }
  };

  const handleInputChange = (e: ChangeEvent<{}>, value: string) => {
    setDisplayedValue(value)
  }

  const cancelAddNew = () => {
    setShowAddNew(false);
    setDisplayedValue("");
    controller.reset();
  }

  const createItem = () => {
    if (props.target) {
      update({ [props.target]: [pop(controller.values, "id")] });
      generateToast("Enregistré.", "success");
    }
  }

  const updateItem = () => {
    if (props.target) {
      update({ [props.target]: [controller.values] });
      generateToast("Mis à jour.", "success");
    }

  }

  return (
    <>
      <Grid container direction="row" alignItems='flex-end'>
        <Autocomplete
          disabled={props.disabled}
          style={{ flex: 1 }}
          id={props.selectId}
          selectOnFocus
          freeSolo
          handleHomeEndKeys
          options={options.filter(e => e.name !== "_NO_NAME_")}
          getOptionLabel={getOptionLabel}
          onChange={handleChange}
          clearOnEscape
          value={localValue}
          inputValue={displayedValue}
          onInputChange={handleInputChange}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);
            // Suggest the creation of a new value
            if (!filtered.length && params.inputValue !== '') {
              filtered.push({
                name: `Ajouter: "${params.inputValue}"`
              });
            }
            return filtered;
          }}
          renderInput={(params) => <TextField
            {...params}
            disabled={props.disabled}
            label={props.selectLabel || "Ajouter un élément"}
          />}
        />
        <Tooltip arrow title="Ajouter depuis la table">
          <div>
            <IconButton
              disabled={props.disabled}
              size="small"
              color="primary"
              onClick={() => { setShowTable(true) }}
            >
              <TocIcon />
            </IconButton>
          </div>
        </Tooltip>
      </Grid>

      <Dialog open={showTable} maxWidth="md" fullWidth onClose={() => { setShowTable(false) }}>
        <DialogContent>
          <MasterTable<Models.Unique>
            data={options.filter(e => e.name !== "_NO_NAME_")}
            headers={headers}
            title={props.dialogTitle || props.title}
            controller={controller}
            onSelectionChange={handleSelectionChange}
            createItem={createItem}
            updateItem={updateItem}
            checkbox
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => { setShowTable(false) }}
          >
            Annuler
          </Button>
          <Button
            disabled={!localSelection.length}
            variant="contained"
            color="primary"
            onClick={selectMultiple}
          >
            Sélectionner
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showAddNew} maxWidth="xl" onClose={cancelAddNew}>
        <DialogTitle>
          Ajout d'un nouvel élément à la liste "{props.title}"
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            <OverviewQuickForm
              data={options}
              headers={headers}
              controller={controller}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={cancelAddNew}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={addNewItemToList}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}


// Listing

interface OverviewMenuProps {
  controllerMenu: Input.InputProps<Inputs.Menus>
  selectLabel?: string
  disabled?: boolean
  transferMode?: boolean
  addCustomMenu: (menu: Pick<Partial<Data.Menu>, "id"> & Omit<Data.Menu, "id"> & Models.Identifiable) => void
  onTransfer: (item: Data.Menu & Models.Quantified) => void
  isMaterialLinked: [boolean, (value: boolean) => void]
  baseQuantity?: number
}

export const OverviewMenu: FC<OverviewMenuProps> = (props) => {

  const inputMenus = props.controllerMenu;
  const [showAddCustomMenu, setShowAddCustomMenu] = useState<boolean>(false)
  const inputCustomMenu = useInput<(Inputs.Menu & Models.Quantified)>({
    id: "",
    name: "_NO_NAME_",
    plats: [],
    price: 0,
    quantity: 1
  });

  const updateMenu = (index: number, item: (Data.Menu & Models.Quantified)) => {
    let menus = inputMenus.values.menus;
    menus.splice(index, 1, item);
    const price = menus.reduce((p, v) => p + v.price * (v.quantity || 1), 0);
    inputMenus.setValues({
      ...inputMenus.values,
      menus: menus,
      price: price
    });
  }

  const selectMenu = (menu: Data.Menu | null) => {
    if (!menu) { return; }
    const newMenus = addItemToPool(inputMenus.values.menus, menu, props.baseQuantity || 1);
    inputMenus.setValues({
      menus: newMenus,
      price: newMenus.reduce((p, v) => p + v.price * (v.quantity || 1), 0),
    });

    setTimeout(() => {
      document.getElementById(`item-quantity${menu.id}`)?.focus();
    }, 200);
  }

  const selectMultipleMenus = (menus: Data.Menu[]) => {
    if (menus.length > 0) {
      for (const menu of menus) {
        selectMenu(menu);
      }
    }
  }

  const deleteMenu = (idx: number) => {
    inputMenus.values.menus.splice(idx, 1);
    inputMenus.setValues({
      menus: inputMenus.values.menus,
      price: inputMenus.values.menus.reduce((p, v) => p + v.price * (v.quantity || 1), 0),
    });
  }

  const editTotal = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    inputMenus.setValues({
      ...inputMenus.values,
      price: Number(e.target.value),
    });
  }

  const handleAddCustomMenu = () => {
    const values = inputCustomMenu.values;
    props.addCustomMenu(values);
    setShowAddCustomMenu(false);
    inputCustomMenu.reset();
  }

  const cancelAddCustomMenu = () => {
    // closing the dialog
    setShowAddCustomMenu(false);
    // for a better animation
    setTimeout(() => {
      inputCustomMenu.reset();
    }, 200);
  }

  return (
    <InputProvider value={inputMenus}>
      {inputMenus.values.menus.length > 0 && (
        inputMenus.values.menus.map((menu, i) => (
          <MenuLine
            readOnly={props.disabled}
            key={menu.id}
            menu={menu}
            transferMode={props.transferMode}
            onUpdate={(editedMenu) => { updateMenu(i, editedMenu) }}
            onDelete={() => { deleteMenu(i) }}
            onTransfer={props.onTransfer}
          />
        ))
      )}
      <Grid container spacing={1} direction="column">
        <Grid item>
          <ItemSelector<Data.Menu>
            target="menus"
            selectId="menu-select"
            disabled={props.disabled}
            title="Menus"
            selectLabel={props.selectLabel}
            onChange={selectMenu}
            onSelect={selectMultipleMenus}
          />
        </Grid>
        <Grid item>
          <Button
            fullWidth
            color="primary"
            disabled={props.disabled}
            onClick={() => { setShowAddCustomMenu(true) }}
          >
            Ajouter des plats hors menu
          </Button>
        </Grid>
      </Grid>
      <Dialog open={showAddCustomMenu} maxWidth="xl" onClose={cancelAddCustomMenu}>
        <DialogTitle>
          Ajouter des plats hors menu
        </DialogTitle>
        <DialogContent>
          <OverviewQuickList
            label="Plats"
            target="plats"
            selectLabel="Ajouter un plat..."
            controller={inputCustomMenu}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={cancelAddCustomMenu}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => { handleAddCustomMenu() }}
          >
            Valider
          </Button>
        </DialogActions>
      </Dialog>
      <TotalLane
        readOnly={props.disabled}
        value={inputMenus.values.price}
        id="menu-total"
        onChange={editTotal}
      />
    </InputProvider>
  );
}


export interface ActionProp {
  label: string
  type: "button" | "switch"
  value?: boolean
}

export type ExpectedTarget = "menus" | "plats" | "materials" | "drinks"

export interface OverviewQuickListProps<T, K> {
  target: ExpectedTarget
  label?: string
  header?: HeadCell<T>
  selectLabel?: string
  dialogTitle?: string
  disabled?: boolean
  controller?: Input.InputProps<T> // T example: Inputs.Drinks
  onTransfer?: (item: K) => void
  transferMode?: boolean,
  onAction?: (e: any) => void
  actionProps?: ActionProp
  onChange?: (e: T) => void
  withoutTotal?: boolean
  baseQuantity?: number
}

export function OverviewQuickList<T extends Models.Priced, K extends Models.Item>(
  props: OverviewQuickListProps<T, K>
) {

  const { data } = useData();
  const classes = useStyles();
  const [showTable, setShowTable] = useState(false);
  const [categorySelected, setCategorySelected] = useState<string>("");
  const [categoryOptions, setCategoryOptions] = useState<Models.Editable[]>([]);

  let controller: Input.InputProps<Models.Priced>;
  let defaultValues: Models.Priced = { price: 0 };
  let options: Models.Editable[] = [];
  let headers: HeadCell<Models.Editable>[] = [];

  if (props.target === "menus") {
    headers = menusParams as any;
    defaultValues = menusDefaultValues;
    options = data.menus;
  }
  else if (props.target === "plats") {
    headers = platsParams as any;
    defaultValues = platsDefaultValues;
    options = data.plats;
  }
  else if (props.target === "materials") {
    headers = materialParams as any;
    defaultValues = materialsDefaultValues;
    options = data.materials;
  }
  else if (props.target === "drinks") {
    headers = drinksParams as any;
    defaultValues = drinksDefaultValues;
    options = data.drinks;
  }
  // inititialize controller anyway
  controller = useInput(defaultValues);

  /** TS utility function */
  const getCollection = () => {
    // @ts-ignore
    return controller.values[props.target] as (Models.Item & T & Models.Identifiable & Models.Quantified)[];
  }

  /** TS utility function */
  const setCollection = (collection: Models.Item[]) => {
    // @ts-ignore
    controller.values[props.target] = collection;
  }

  if (props.controller) {
    controller = props.controller as any;
  }

  const getGlobalPrice = (collection?: Models.Item[]) => {
    const items = collection ?? getCollection();
    return items.reduce((p, v) => p + v.price * (v.quantity || 1), 0);
  }

  const updateItem = (index: number, quantity: number) => {
    const item = getCollection()[index];

    // in case of material -> take the batch size into account
    if (props.target === "materials") {
      const material = item as unknown as Models.Quantified & Data.Material;
      const remainder = material.quantity % material.batch;
      if (item.quantity < quantity) { // add a batch
        material.quantity += material.batch - remainder;
      } else if (item.quantity > quantity) { // remove a batch
        material.quantity -= material.batch + remainder;
      }
    } else { // otherwise just update the quantity
      item.quantity = quantity;
    }

    controller.values.price = getGlobalPrice();
    controller.setValues(controller.values);
    if (props.onChange) {
      props.onChange(controller.values as T);
    }
  }

  const addItem = (item: Models.Editable) => {
    // update collection
    setCollection(addItemToPool(getCollection(), item, props.baseQuantity || 1));
    controller.values.price = getGlobalPrice();

    controller.setValues(controller.values);
    if (props.onChange) {
      props.onChange(controller.values as T);
    }

    setShowTable(false)
    setTimeout(() => {
      document.getElementById(`item-quantity${item.id}`)?.focus();
    }, 200);
  }

  const addMultipleItems = (items: Models.Editable[]) => {
    for (const item of items) {
      addItem(item);
    }
    setShowTable(false)
  }

  const deleteItem = (idx: number) => {
    getCollection().splice(idx, 1);
    controller.setValues(controller.values);
    if (props.onChange) {
      props.onChange(controller.values as T);
    }
  }

  const editTotal = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    controller.values.price = Number(e.target.value)
    controller.setValues(controller.values);
    if (props.onChange) {
      props.onChange(controller.values as T);
    }
  }

  const configGroupsHeader = headers.find(e => e.groupsConfig)

  const hSubItemsChange = (items: (Models.Editable & Models.Quantified)[]) => {
    if (props.onChange && props.controller) {
      let values: T = props.controller.values;
      // @ts-ignore
      values[props.target] = items;
      if (values.price) {
        values.price = items.reduce((p, v) => p + v.price * (v.quantity || 1), 0)
      }
      props.controller.setValues(values);
      props.onChange(values);
    }
  }

  const hSubItemsCategorySelect = (value: string) => {
    if (configGroupsHeader) {
      setShowTable(true);
      const selection = options.filter(option => option[configGroupsHeader.field] === value);
      setCategorySelected(value);
      setCategoryOptions(selection);
    }
  }

  return (
    <>
      <InputProvider value={controller}>
        {!configGroupsHeader && getCollection().length > 0 && (
          getCollection().map((item: Models.Item, i: number) => (
            <ItemLine
              readOnly={props.disabled}
              target={props.target}
              key={item.id}
              item={item}
              price={item.price * item.quantity}
              onDelete={() => { deleteItem(i) }}
              onQuantityChange={(quantity) => { updateItem(i, quantity) }}
              transferMode={props.transferMode}
              onTransfer={(item) => {
                if (props.onTransfer) {
                  props.onTransfer(item as K);
                }
              }}
            />
          ))
        )}
        {configGroupsHeader && (
          <ItemSubTable<Models.Editable>
            groupingHeader={configGroupsHeader}
            items={getCollection()}
            onItemsChange={hSubItemsChange}
            onCategorySelect={hSubItemsCategorySelect}
          />
        )}
        <Grid container spacing={1} direction="column">
          <Grid item>
            <ItemSelector<Models.Editable>
              selectLabel={props.selectLabel}
              target={props.target}
              headers={headers}
              selectId={`${props.target}-select`}
              disabled={props.disabled}
              title={props.label}
              dialogTitle={props.dialogTitle}
              options={options}
              onChange={addItem}
              onSelect={addMultipleItems}
            />
          </Grid>
          {props.actionProps && !!props.onAction && (
            <Grid item>
              {props.actionProps.type === "switch" && (
                <FormControlLabel
                  label={props.actionProps.label}
                  control={
                    <Switch
                      disabled={props.disabled}
                      checked={props.actionProps.value}
                      onChange={props.onAction}
                      color="primary"
                    />
                  }
                />
              )}
              {props.actionProps.type === "button" && (
                <Button
                  fullWidth
                  color="primary"
                  disabled={props.disabled}
                  onClick={props.onAction}
                >
                  {props.actionProps.label}
                </Button>
              )}
            </Grid>
          )}
        </Grid>
        {!props.withoutTotal && (
          <TotalLane
            readOnly={props.disabled}
            value={controller.values.price}
            id={`${props.target}-total`}
            onChange={editTotal}
          />
        )}
      </InputProvider>

      <Dialog open={showTable} maxWidth="md" fullWidth onClose={() => { setShowTable(false) }}>
        <DialogTitle className={classes.formattedDialogTitle}>{props.target} ({categorySelected || 'Tous'})</DialogTitle>
        <DialogContent>
          <ItemSelector
            target={props.target}
            title={props.label}
            options={categoryOptions}
            onChange={addItem}
            onSelect={addMultipleItems}
            selectLabel={categorySelected ? `${props.selectLabel} (${categorySelected})` : props.selectLabel}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => { setShowTable(false) }}
          >
            Annuler
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}