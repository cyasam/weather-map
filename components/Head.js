import Head from 'next/head';

const AppHead = ({ title }) => (
  <Head>
    <title>{title}</title>
    <link rel="icon" href="/static/images/favicon.ico" type="image/x-icon" />
    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
  </Head>
);

export default AppHead;
