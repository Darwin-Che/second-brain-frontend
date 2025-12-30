import * as React from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { styled } from '@mui/material/styles';

type NumberSpinnerProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

const StyledTextField = styled(TextField)({
  '& input[type=number]': {
    MozAppearance: 'textfield',
  },
  '& input[type=number]::-webkit-outer-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
  '& input[type=number]::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
});

export function NumberSpinner({
  value,
  onChange,
  min = 15,
  max = Infinity,
  step = 1,
}: NumberSpinnerProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const [inputValue, setInputValue] = React.useState(String(value));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    // Allow empty string or valid numbers
    if (val === '') {
      return;
    }
    
    const numVal = Number(val);
    if (!isNaN(numVal)) {
      onChange(clamp(numVal));
    }
  };

  const handleBlur = () => {
    // If empty on blur, reset to min
    if (inputValue === '' || Number(inputValue) < min) {
      setInputValue(String(min));
      onChange(min);
    } else {
      setInputValue(String(value));
    }
  };

  React.useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  return (
    <StyledTextField
      type="text"
      inputMode="numeric"
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <IconButton
                size="small"
                onClick={() => onChange(clamp(value - step))}
                edge="start"
              >
                <RemoveIcon />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => onChange(clamp(value + step))}
                edge="end"
              >
                <AddIcon />
              </IconButton>
            </InputAdornment>
          ),
        },
        htmlInput: {
          min,
          max,
          step,
          style: { textAlign: 'center' },
        },
      }}
    />
  );
}