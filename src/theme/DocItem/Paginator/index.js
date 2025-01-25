import React from 'react';
import Paginator from '@theme-original/DocItem/Paginator';
import { Waline } from '@site/src/components/Waline';

export default function PaginatorWrapper(props) {
  return (
    <>
      <Paginator {...props} />
      <Waline serverURL="https://waline-sigma-rose.vercel.app/"/>

    </>
  );
}
