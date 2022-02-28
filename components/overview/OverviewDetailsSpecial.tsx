// react
import { FC } from 'react';

// utils
import { Inputs } from '../../utils/types';
import { InputProvider, Input, InputField } from '../../utils/Input';


export interface OverviewDetailsSpecialProps {
  disabled?: boolean
  inputComment: Input.InputProps<Inputs.Comment>
}

const OverviewDetailsSpecial: FC<OverviewDetailsSpecialProps> = (props) => {

  return (
    <InputProvider value={props.inputComment}>
      <InputField
          field="comment"
          label="Commentaires"
          optional
          size="fullwidth"
          disabled={props.disabled}
          textFieldProps={{
            multiline: true,
            rows: 5,
          }}
        />
    </InputProvider>
  );
}

export default OverviewDetailsSpecial;