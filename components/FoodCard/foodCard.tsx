// react
import { FC, Fragment } from "react";

// mui
import { CardContent, Grid, Card, Typography, Box } from "@material-ui/core";

// utils
import type { Data } from "../../utils/types";
import { formatNumber } from "../../utils/Helper";

export interface FoodCardProps {
	materials: Data.Event["drinks"];
}

const FoodCard: FC<FoodCardProps> = ({ materials }) => {
	const totalCHF =
		materials.length > 0
			? formatNumber(
					materials.map((m) => m.price * m.quantity).reduce((a, b) => a + b)
			  )
			: "NA";
	return (
		<Box component={Card} height="100%">
			<CardContent>
				<Grid container spacing={1}>
					<Grid item xs={4}>
						<Typography align="center">
							<Box component="span" fontWeight="bold">
								Quantite
							</Box>
						</Typography>
					</Grid>
					<Grid item xs={4}>
						<Typography align="center">
							<Box component="span" fontWeight="bold">
								Materiel
							</Box>
						</Typography>
					</Grid>
					<Grid item xs={4}>
						<Typography align="center">
							<Box component="span" fontWeight="bold">
								Prix
							</Box>
						</Typography>
					</Grid>
					{materials.map((material) => {
						return (
							<Fragment key={material.id}>
								<Grid item xs={4}>
									<Typography align="center">{material.quantity}</Typography>
								</Grid>
								<Grid item xs={4}>
									<Typography align="center">{material.name}</Typography>
								</Grid>
								<Grid item xs={4}>
									<Typography align="center">{material.price}</Typography>
								</Grid>
							</Fragment>
						);
					})}
					<Grid item xs={8}></Grid>
					<Grid item xs>
						<Typography align="center">
							<Box component="span" fontWeight="bold">
								Total: CHF {totalCHF}
							</Box>
						</Typography>
					</Grid>
				</Grid>
			</CardContent>
		</Box>
	);
};

export default FoodCard;
