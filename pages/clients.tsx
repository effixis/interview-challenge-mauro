// react
import { FC } from 'react';

// mui
import { Paper } from '@material-ui/core';

// utils
import { Data, Inputs } from '../utils/types';
import { Input, useInput } from '../utils/Input';
import { pop } from '../utils/Helper';
import { clientsParams } from '../utils/MasterTableParams';

// hooks
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';

// components
import Page from '../components/Page';
import MasterTable from '../components/MasterTable';


export interface PageClientProps { }

const PageClient: FC<PageClientProps> = () => {

  const { data, update } = useData();
  const { generateToast } = useToast();

  const input = useInput<Inputs.Client>({
    id: undefined,
    name: "",
    email: "",
    phone: "",
  });

  return (
    <Page
      withAuth
      withData
      title="Clients"
    >
      <Paper>
        <MasterTable<Data.Client>
          data={data.clients}
          headers={clientsParams}
          title="Clients"
          createItem={() => {
            update({ clients: [pop(input.values, "id")] });
            generateToast("Client saved.", "success");
          }}
          updateItem={() => {
            update({ clients: [input.values] });
            generateToast("Client updated.", "success");
          }}
          controller={input}
          checkbox={false}
        />
      </Paper>
    </Page>
  );
};

export default PageClient;