// react
import { FC } from 'react';

// mui
import { Paper } from '@material-ui/core';

// utils
import { Data, Inputs } from '../utils/types';
import { useInput } from '../utils/Input';
import { pop } from '../utils/Helper';
import { menuDefaultValues } from '../utils/defaultValues';
import { menusParams } from '../utils/MasterTableParams';

// hooks
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';

// components
import Page from '../components/Page';
import MasterTable from '../components/MasterTable';



export interface PageMenuProps { }

const PageMenu: FC<PageMenuProps> = () => {

  const { data, update } = useData();
  const { generateToast } = useToast();

  const input = useInput<Inputs.Menu>(menuDefaultValues);

  return (
    <Page
      withAuth
      withData
      title="Menu"
    >
      <Paper>
        <MasterTable<Data.Menu>
          data={data.menus.filter(m => m.name !== "_NO_NAME_")}
          headers={menusParams}
          title="Menus"
          createItem={() => {
            update({ menus: [pop(input.values, "id")] });
            generateToast("Menu saved.", "success");
          }}
          updateItem={() => {
            update({ menus: [input.values] });
            generateToast("Menu updated.", "success");
          }}
          // @ts-ignore
          controller={input}
          checkbox={false}
        />
      </Paper>
    </Page>
  );
}

export default PageMenu;