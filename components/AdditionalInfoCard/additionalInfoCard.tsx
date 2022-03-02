// react
import { FC } from "react";

// mui
import { CardContent, Grid, Card, Typography, Box } from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
// utils
import type { Data } from "../../utils/types";

export interface AdditionalInfoCardProps {
	price: Data.Event["price"];
}

const AdditionalInfoCard: FC<AdditionalInfoCardProps> = ({}) => {
	return (
		<Box component={Card} height="100%" display="flex" alignItems="center">
			<Box component={CardContent} mb={0}>
				<Grid container alignItems="center" justify="center">
					<Grid item container xs={6} spacing={2} justify="space-evenly">
						<Grid item>
							<Typography>Service</Typography>
						</Grid>
						<Grid item>
							<CheckIcon fontSize="small" />
						</Grid>
					</Grid>
					<Grid item container xs={6} spacing={2} justify="space-evenly">
						<Grid item>
							<Typography>Transport</Typography>
						</Grid>
						<Grid item>
							<CheckIcon fontSize="small" />
						</Grid>
					</Grid>
					<Grid item container xs={6} spacing={2} justify="space-evenly">
						<Grid item>
							<Typography>Boisson</Typography>
						</Grid>
						<Grid item>
							<CheckIcon fontSize="small" />
						</Grid>
					</Grid>
					<Grid item container xs={6} spacing={2} justify="space-evenly">
						<Grid item>
							<Typography>Materiel</Typography>
						</Grid>
						<Grid item>
							<CheckIcon fontSize="small" />
						</Grid>
					</Grid>
				</Grid>
			</Box>
		</Box>
	);
};

export default AdditionalInfoCard;
