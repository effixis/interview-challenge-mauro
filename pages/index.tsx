// react
import { FC, useState } from "react";

// mui
import { Collapse, Grid, makeStyles, Box, Typography } from "@material-ui/core";

// utils
import { Data, Calendar as CalendarType } from "../utils/types";

// hooks
import { useData } from "../hooks/useData";

// components
import Page from "../components/Page";
import History from "../components/overview/History";
import ClientInfo from "../components/ClientInfo";
import DishesMenuCard from "../components/DishesMenuCard";
import DrinkCard from "../components/DrinkCard";
import FoodCard from "../components/FoodCard";
import ServiceCard from "../components/ServiceCard";
import AdditionalInfoCard from "../components/AdditionalInfoCard";
import DeliveryCard from "../components/DeliveryCard";

const useStyles = makeStyles((theme) => ({
	paper: {
		margin: theme.spacing(1),
		padding: theme.spacing(2),
	},
	withMargin: {
		margin: theme.spacing(1),
	},
	landingHeader: {
		display: "flex",
		gap: theme.spacing(2),
		flexWrap: "wrap",
		alignItems: "center",
		margin: theme.spacing(1),
		minHeight: theme.spacing(6),
	},
	spacingTop: {
		paddingTop: "2rem",
	},
	spacingLeft: {
		[theme.breakpoints.up("sm")]: {
			paddingLeft: 0,
			paddingTop: "2rem",
		},
		[theme.breakpoints.up("md")]: {
			paddingLeft: "2rem",
			paddingTop: 0,
		},
	},
	serviceCard: {
		paddingTop: "1rem",
		[theme.breakpoints.up("md")]: {
			paddingTop: 0,
		},
	},
}));

export interface PageOverviewProps {}

const PageOverview: FC<PageOverviewProps> = (props) => {
	const classes = useStyles();
	const { data } = useData();
	const [localClient, setLocalClient] = useState<Data.Client | null>(null);
	const [localSelection, setLocalSelection] = useState<string[]>([]);
	const [filters, setFilters] = useState<CalendarType.EventFilters>(
		{} as CalendarType.EventFilters
	);

	const [info, setInfo] = useState<Data.Event | null>(null);

	const handleSetEvent = (event: Data.Event | null) => {
		// handle the click event here !
		setInfo(event);
	};

	return (
		<Page withAuth={false} withData title="Overview">
			<Grid container direction="column">
				<Grid item>
					<Collapse in={true}>
						<Grid className={classes.withMargin}>
							<History
								data={data}
								onClick={(event) => {
									handleSetEvent(event);
								}}
								filters={filters}
								selected={localSelection}
								selectedClient={localClient}
							/>
						</Grid>
					</Collapse>
				</Grid>
				{info ? (
					<>
						<Box pt={4} pl={4.5} pr={4.5}>
							<ClientInfo {...info} />
						</Box>
						<Box pt={2} pl={1.5} pr={1.5}>
							<DeliveryCard {...info} />
						</Box>
						<Box pt={2} pl={1.5} pr={1.5}>
							<Grid container spacing={5}>
								<Grid item md={6} xs={12}>
									<DishesMenuCard {...info} />
								</Grid>
								<Grid item md={6} xs={12} container>
									<Grid item xs={12}>
										<FoodCard {...info} />
									</Grid>

									<Grid
										item
										xs={12}
										container
										className={`${classes.spacingTop}`}
									>
										<Grid item md={6} xs={12}>
											<DrinkCard {...info} />
										</Grid>
										<Grid
											item
											md={6}
											xs={12}
											container
											className={`${classes.spacingLeft}`}
										>
											<Box
												component={Grid}
												item
												xs={12}
												className={classes.serviceCard}
											>
												<ServiceCard {...info} />
											</Box>
											<Box component={Grid} item xs={12} pt={2}>
												<AdditionalInfoCard {...info} />
											</Box>
										</Grid>
									</Grid>
								</Grid>
							</Grid>
						</Box>
						<Box pt={3} pl={1} pr={1}>
							<Typography>
								<Box component="span" fontWeight="bold">
									Commentaires:
								</Box>{" "}
								{info.comment}
							</Typography>
						</Box>
					</>
				) : null}
			</Grid>
		</Page>
	);
};

export default PageOverview;
