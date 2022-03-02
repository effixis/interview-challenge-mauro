// react
import { FC } from "react";

// mui
import { CardContent, Grid, Card, Box, Typography } from "@material-ui/core";

// utils
import type { Data } from "../../utils/types";

export interface DishesMenuCardProps {
	menus: Data.Event["menus"];
	people: Data.Event["people"];
}

const DishesMenuCard: FC<DishesMenuCardProps> = ({ menus, people }) => {
	const totalCHF =
		menus.length > 0
			? Math.round(
					menus
						.map((m) => m.price * m.quantity)
						.reduce((prev, cur) => {
							return prev + cur;
						}) * 100
			  ) / 100
			: "NA";
	const totalPP =
		menus.length > 0
			? Math.round(
					(menus
						.map((m) => m.price)
						.reduce((prev, cur) => {
							return prev + cur;
						}) /
						people) *
						100
			  ) / 100
			: "NA";
	return (
		<Box component={Card} height="100%">
			<CardContent>
				<Box pt={3} pl={1} pr={1}>
					<Grid container spacing={2}>
						<Grid item xs={4}>
							<Typography>
								<Box component="span" fontWeight="bold">
									Menu
								</Box>
							</Typography>
						</Grid>
						<Grid item xs={4}>
							<Typography align="center">
								<Box component="span" fontWeight="bold">
									Plats
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
					</Grid>
				</Box>
				<Box pt={4} pb={2} pl={1} pr={1}>
					{menus.map((menu) => {
						return (
							<Grid key={menu.id} container spacing={2}>
								<Grid item xs={4}>
									<Typography>
										{menu.quantity} x {menu.name}
									</Typography>
								</Grid>
								<Grid item xs={4}>
									{menu.plats.map((plat) => (
										<Typography key={plat.id}>
											{plat.quantity} {plat.name}
										</Typography>
									))}
								</Grid>
								<Grid
									item
									xs={4}
									container
									direction="column"
									justify="flex-end"
									alignItems="center"
								>
									<Typography>
										<Box component="span" fontWeight="bold">
											{menu.price} p.p.
										</Box>
									</Typography>
								</Grid>
							</Grid>
						);
					})}
				</Box>
				<Grid container>
					<Grid item xs></Grid>
					<Grid item xs>
						<Typography align="center">
							<Box component="span" fontWeight="bold">
								Total: CHF {totalCHF} {totalPP}
								p.p.
							</Box>
						</Typography>
					</Grid>
				</Grid>
			</CardContent>
		</Box>
	);
};

export default DishesMenuCard;
