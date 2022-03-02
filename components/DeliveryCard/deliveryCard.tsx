// react
import { FC } from "react";

// mui
import { Grid, Paper, Typography, Box, makeStyles } from "@material-ui/core";

// utils
import type { Data } from "../../utils/types";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
	noMargin: {
		height: "100%",
		margin: 0,
	},
}));

export interface DeliveryCardProps {
	date: Data.Event["date"];
	type: Data.Event["type"];
	people: Data.Event["people"];
	client: Data.Event["client"];
	address: Data.Event["address"];
}

const DeliveryCard: FC<DeliveryCardProps> = ({
	date,
	type,
	people,
	address,
}) => {
	const classes = useStyles();
	return (
		<Paper>
			<Box p={3}>
				<Grid container>
					<Grid item xs={4} container direction="column" spacing={1}>
						<Grid item>
							<Typography display="inline">
								<Box component="span" fontWeight="bold" display="inherit">
									Nombre Personnes:{" "}
								</Box>
								{people}
							</Typography>
						</Grid>
						<Grid item>
							<Typography display="inline">
								<Box component="span" fontWeight="bold" display="inherit">
									Date:{" "}
								</Box>
								{moment(date).format("DD.MM.YYYY")}
							</Typography>
						</Grid>
						<Grid item>
							<Typography display="inline">
								<Box component="span" fontWeight="bold" display="inherit">
									Type:{" "}
								</Box>
								{type}
							</Typography>
						</Grid>
					</Grid>
					<Grid item xs={4} container direction="column" spacing={1}>
						<Grid item>
							<Typography display="inline" className={classes.noMargin}>
								<Box component="span" fontWeight="bold" display="inherit">
									Heure Livraison:{" "}
								</Box>
								NA
							</Typography>
						</Grid>
						<Grid item>
							<Typography display="inline">
								<Box component="span" fontWeight="bold" display="inherit">
									Heure reprise:{" "}
								</Box>
								NA
							</Typography>
						</Grid>
					</Grid>
					<Grid item xs={4} container direction="column" spacing={1}>
						<Grid item>
							<Typography>
								<Box component="span" fontWeight="bold">
									Adresse:{" "}
								</Box>
							</Typography>
						</Grid>
						<Grid item>
							<Typography>{address.address}</Typography>
						</Grid>
						<Grid item>
							<Typography>
								{address.canton} {address.postcode} {address.town}
							</Typography>
						</Grid>
					</Grid>
				</Grid>
			</Box>
		</Paper>
	);
};

export default DeliveryCard;
