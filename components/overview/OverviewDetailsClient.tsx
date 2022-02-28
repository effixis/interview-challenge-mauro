// react
import { FC } from 'react';

// mui
import PersonIcon from '@material-ui/icons/Person';
import AlternateEmailIcon from '@material-ui/icons/AlternateEmail'
import PhoneIcon from '@material-ui/icons/Phone';

// utils
import { Inputs, Data } from '../../utils/types';
import { InputProvider, InputField, Input } from '../../utils/Input';

// hooks
import { useData } from '../../hooks/useData';

// components
import SearchField from '../SearchField';

export interface OverviewClientProps {
  inputClientDate: Input.InputProps<Inputs.ClientDate>
  disabled?: boolean
  onClientChange?: (client: Data.Client) => void
}

const OverviewClient: FC<OverviewClientProps> = (props) => {

  const { data } = useData();
  const inputClientDate = props.inputClientDate;
  const getClientByName = (name: string) => {
    return data.clients.find((c) => c.name === name);
  }

  const selectCustomer = (option: string | null) => {
    if (option === null) {
      inputClientDate.setValues({
        ...inputClientDate.values,
        client: "",
        email: "",
        phone: "",
      });
    } else {
      const client = getClientByName(option);
      if (client) {
        inputClientDate.setValues({
          ...inputClientDate.values,
          client: client.name,
          email: client.email,
          phone: client.phone,
        });
        if(props.onClientChange) {
          props.onClientChange(client)
        }
      }
    }
  }

  return (
    <>
      <InputProvider value={inputClientDate}>
        <SearchField
          expandable
          options={data.clients.map(client => client.name)}
          icon={<PersonIcon />}
          disabled={props.disabled}
          inputFieldProps={{
            field: "client",
            label: "Sélectionnez un client",
            size: "fullwidth"
          }}
          onChange={(option) => { selectCustomer(option) }}
        />

        <InputField
          field="email"
          label="Email"
          size="fullwidth"
          disabled={props.disabled}
          icon={<AlternateEmailIcon />}
        />
        <InputField
          field="phone"
          label="Phone"
          size="fullwidth"
          disabled={props.disabled}
          icon={<PhoneIcon />}
        />
      </InputProvider>
    </>
  )
}

export default OverviewClient;