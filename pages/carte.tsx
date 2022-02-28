// react
import { FC } from 'react';

// mui
import { Paper } from '@material-ui/core';

// utils
import { Data, Inputs } from '../utils/types';
import { useInput } from '../utils/Input';
import { platDefaultValues } from '../utils/defaultValues';
import { platsParams } from '../utils/MasterTableParams';
import { pop } from '../utils/Helper';

// hooks
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';

// components
import Page from '../components/Page';
import MasterTable from '../components/MasterTable';


export interface PageDishProps { }

const PageDish: FC<PageDishProps> = () => {

  const { data, update } = useData();
  const { generateToast } = useToast();

  const input = useInput<Inputs.Plat>(platDefaultValues);

  return (
    <Page
      withAuth
      withData
      title="Plats"
    >
      <Paper>
        <MasterTable<Data.Plat>
          data={data.plats}
          headers={platsParams}
          title="Plats"
          createItem={() => {
            update({ plats: [pop(input.values, "id")] });
            generateToast("Plat enregistré.", "success");
          }}
          updateItem={() => {
            update({ plats: [input.values] });
            generateToast("Plat mis à jour.", "success");
          }}
          // @ts-ignore
          controller={input}
          checkbox={false}
        />
      </Paper>
    </Page>
  );
};

export default PageDish;