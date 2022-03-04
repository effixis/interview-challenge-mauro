// react
import { FC } from "react";

// mui
import { CardContent, Grid, Card, Typography, Box } from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
// utils
import type { Data } from "../../utils/types";

export interface AdditionalInfoCardProps {
	delivery: Data.Event["delivery"];
	returnDelivery: Data.Event["returnDelivery"];
	service: Data.Event["service"];
	drinks: Data.Event["drinks"];
	materials: Data.Event["materials"];
}

const AdditionalInfoCard: FC<AdditionalInfoCardProps> = ({
	delivery,
	returnDelivery,
	service,
	drinks,
	materials,
}) => {
	const hasService =
		service &&
		(service.cooksDuration ||
			service.cooksN ||
			service.serversDuration ||
			service.serversN);
	const hasTransport = delivery || returnDelivery;
	const hasBoisson = drinks && drinks.length > 0;
	const hasMateriel = materials && materials.length > 0;
	return (
		<Box component={Card} height="100%" display="flex" alignItems="center">
			<Box component={CardContent} mb={0}>
				<Grid container alignItems="center" justify="center">
					<Grid item container xs={6} spacing={2} justify="space-evenly">
						<Grid item>
							<Typography>Service</Typography>
						</Grid>
						<Grid item>
							{hasService ? <CheckIcon fontSize="small" /> : null}
						</Grid>
					</Grid>
					<Grid item container xs={6} spacing={2} justify="space-evenly">
						<Grid item>
							<Typography>Transport</Typography>
						</Grid>
						<Grid item>
							{hasTransport ? <CheckIcon fontSize="small" /> : null}
						</Grid>
					</Grid>
					<Grid item container xs={6} spacing={2} justify="space-evenly">
						<Grid item>
							<Typography>Boisson</Typography>
						</Grid>
						<Grid item>
							{hasBoisson ? <CheckIcon fontSize="small" /> : null}
						</Grid>
					</Grid>
					<Grid item container xs={6} spacing={2} justify="space-evenly">
						<Grid item>
							<Typography>Materiel</Typography>
						</Grid>
						<Grid item>
							{hasMateriel ? <CheckIcon fontSize="small" /> : null}
						</Grid>
					</Grid>
				</Grid>
			</Box>
		</Box>
	);
};

export default AdditionalInfoCard;
