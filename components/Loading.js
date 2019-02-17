import { Fragment } from 'react';

const Loading = ({ open }) => {
  if (!open) {
    return null;
  }

  return (
    <Fragment>
      <div className="loading">
        <img src="/static/images/loader.svg" alt="Loader" />
      </div>
      <style jsx>
        {`
          .loading {
            position: fixed;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #17263c;
            z-index: 100;
          }
        `}
      </style>
    </Fragment>
  );
};

export default Loading;
