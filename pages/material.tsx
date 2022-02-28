// react
import { FC } from 'react';

// mui
import { Paper } from '@material-ui/core';

// utils
import { Data, Inputs } from '../utils/types';
import { Input, useInput } from '../utils/Input';
import { pop } from '../utils/Helper';
import { materialParams } from '../utils/MasterTableParams';

// hooks
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';

// components
import Page from '../components/Page';
import MasterTable from '../components/MasterTable';
import { materialDefaultValues } from '../utils/defaultValues';

export interface PageMaterialProps { }

const PageMaterial: FC<PageMaterialProps> = () => {

  const { data, update } = useData();
  const { generateToast } = useToast();

  const input = useInput<Inputs.Material>(materialDefaultValues);

  return (
    <Page
      withAuth
      withData
      title="Material"
    >
      <Paper>
        <MasterTable<Data.Material>
          data={data.materials}
          headers={materialParams}
          title="Matériel"
          createItem={() => {
            update({ materials: [pop(input.values, "id")] });
            generateToast("Material saved.", "success");
          }}
          updateItem={() => {
            update({ materials: [input.values] });
            generateToast("Material updated.", "success");
          }}
          controller={input}
          checkbox={false}
        />
      </Paper>
    </Page>
  );
};

export default PageMaterial;