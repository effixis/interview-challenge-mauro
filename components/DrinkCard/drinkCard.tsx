// react
import { FC, Fragment } from "react";

// mui
import { CardContent, Grid, Card, Box, Typography } from "@material-ui/core";

// utils
import type { Data } from "../../utils/types";

export interface DrinkCardProps {
	drinks: Data.Event["drinks"];
}

const DrinkCard: FC<DrinkCardProps> = ({ drinks }) => {
	const totalCHF =
		drinks.length > 0
			? Math.round(
					drinks.map((d) => d.price * d.quantity).reduce((a, b) => a + b) * 100
			  ) / 100
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
								Boisson
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
					{drinks.map((drink) => {
						return (
							<Fragment key={drink.id}>
								<Grid item xs={4}>
									<Typography align="center">{drink.quantity}</Typography>
								</Grid>
								<Grid item xs={4}>
									<Typography align="center">{drink.name}</Typography>
								</Grid>
								<Grid item xs={4}>
									<Typography align="center">{drink.price}</Typography>
								</Grid>
							</Fragment>
						);
					})}
					<Grid item xs={12} container>
						<Grid item xs></Grid>
						<Grid item xs>
							<Typography align="center">
								<Box component="span" fontWeight="bold">
									Total: CHF {totalCHF}
								</Box>
							</Typography>
						</Grid>
					</Grid>
				</Grid>
			</CardContent>
		</Box>
	);
};

export default DrinkCard;
