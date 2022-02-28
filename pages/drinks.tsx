// react
import { FC } from 'react';

// mui
import { Paper } from '@material-ui/core';

// utils
import { Data, Inputs } from '../utils/types';
import { Input, useInput } from '../utils/Input';
import { pop } from '../utils/Helper';
import { drinksParams } from '../utils/MasterTableParams';
import { drinkDefaultValues } from '../utils/defaultValues';

// hooks
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';

// components
import Page from '../components/Page';
import MasterTable from '../components/MasterTable';

export interface PageDrinksProps { }

const PageDrinks: FC<PageDrinksProps> = () => {

  const { data, update } = useData();
  const { generateToast } = useToast();

  const input = useInput<Inputs.Drink>(drinkDefaultValues);

  return (
    <Page
      withAuth
      withData
      title="Drinks"
    >
      <Paper>
        <MasterTable<Data.Drink>
          data={data.drinks}
          headers={drinksParams}
          title="Boissons"
          createItem={() => {
            update({ drinks: [pop(input.values, "id")] });
            generateToast("Drink saved.", "success");
          }}
          updateItem={() => {
            update({ drinks: [input.values] });
            generateToast("Drink updated.", "success");
          }}
          controller={input}
        />
      </Paper>
    </Page>
  );
};

export default PageDrinks;