// react
import { useEffect, useState } from "react";

// mui
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, makeStyles, TextField, Typography } from "@material-ui/core";
import {
	IconButton,
	Tooltip,
	Table,
	TableRow,
	TableCell,
	TableBody,
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

// utils
import { useData } from "../../hooks/useData";
import TitleOptions from "./TitleOptions";

export interface TableOptionsProps {
	title: string
	id?: string
}

function TableOptions(props: TableOptionsProps) {

	const { data, update } = useData();
	const [localArray, setLocalArray] = useState<string[]>([])
	const [localValue, setLocalValue] = useState<string>("")
	const [showAdd, setShowAdd] = useState(false)

	const fieldId = "table-sorter-field-" + (props.id || '')

	useEffect(() => {
		const arr = data.config.categoriesSorted || [];
		setLocalArray(arr)
	}, [data.config]);

	const handleClose = () => {
		setShowAdd(false);
		setLocalValue("");
	}

	const handleOpen = () => {
		setShowAdd(true)
		setTimeout(() => {
			document.getElementById(fieldId)?.focus();
		}, 200)
	}

	const handleAjouter = () => {
		const arr = localArray;
		arr.push(localValue);
		setLocalArray(arr);
		handleClose();
		saveValue(arr);
	}

	const moveItem = (from: number, to: number) => {
		let arr = JSON.parse(JSON.stringify(localArray));
		let element = arr[from];
		arr.splice(from, 1);
		arr.splice(to, 0, element);
		setLocalArray(arr);
		saveValue(arr);
	}

	const removeItem = (index: number) => {
		const arr = localArray
		arr.splice(index, 1);
		setLocalArray(arr);
		saveValue(arr);
	}

	const saveValue = (value: string[]) => {
		setTimeout(() => {
			update({
				config: { categoriesSorted: value }
			});
		}, 200)
	}

	const hKeyUp = (e: { code: string; }) => {
		if (e.code === "Enter") {
			handleAjouter();
		}
	}

	return (
		<>
			<TitleOptions
				title={props.title}
				add={handleOpen}
			/>

			<Table>
				<TableBody>
					{localArray.map((item, i) => (
						<TableRow>
							<TableCell>
								{(i + 1)}.
							</TableCell>
							<TableCell component="th" scope="row">
								{item}
							</TableCell>
							<TableCell padding="none">
								{i > 0 && (
									<IconButton onClick={() => { moveItem(i, i - 1) }}>
										<KeyboardArrowUpIcon />
									</IconButton>
								)}
								{(i < localArray.length - 1) && (
									<IconButton onClick={() => { moveItem(i, i + 1) }}>
										<KeyboardArrowDownIcon />
									</IconButton>
								)}
								<IconButton onClick={() => { removeItem(i) }}>
									<RemoveIcon color="error" />
								</IconButton>

							</TableCell>
						</TableRow>
					))}

				</TableBody>
			</Table>

			<Dialog open={showAdd} maxWidth="sm" fullWidth onClose={handleClose}>
				<DialogTitle>
					Ajoutez un élément
				</DialogTitle>
				<DialogContent>
					<TextField
						id={fieldId}
						label="Nouvelle valeur"
						value={localValue}
						fullWidth
						onChange={(e) => { setLocalValue(e.target.value) }}
						onKeyUp={hKeyUp}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>
						Fermer
					</Button>
					<Button color="primary" onClick={handleAjouter}>
						Ajouter
					</Button>
				</DialogActions>
			</Dialog>


		</>
	);
}

export default TableOptions;