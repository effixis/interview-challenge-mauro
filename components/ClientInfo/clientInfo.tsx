// react
import { FC } from "react";

// mui
import { Grid, Typography, makeStyles } from "@material-ui/core";

// utils
import type { Data } from "../../utils/types";

const useStyles = makeStyles((theme) => ({
	bold: {
		fontWeight: "bold",
	},
}));

export interface ClientInfoProps {
	id: Data.Event["id"];
	client: Data.Event["client"];
}

const ClientInfo: FC<ClientInfoProps> = ({ id, client }) => {
	const classes = useStyles();
	return (
		<Grid container>
			<Grid item xs={4}>
				<Typography className={classes.bold}>Client: {client.name}</Typography>
			</Grid>
			<Grid item xs={4}>
				<Typography className={classes.bold}>Tel: {client.phone}</Typography>
			</Grid>
			<Grid item xs={4}>
				<Typography className={classes.bold}>BDC: {id}</Typography>
			</Grid>
		</Grid>
	);
};

export default ClientInfo;
