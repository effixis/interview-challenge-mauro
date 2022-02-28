// next
import type { AppProps } from 'next/app';

// utils
import { AuthProvider } from '../utils/Firebase';

// hooks
import { DataProvider } from '../hooks/useData';
import { ToastProvider } from '../hooks/useToast';

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default MyApp;
