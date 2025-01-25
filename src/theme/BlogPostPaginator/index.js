import React from 'react';
import BlogPostPaginator from '@theme-original/BlogPostPaginator';
import { Waline } from '@site/src/components/Waline';

export default function BlogPostPaginatorWrapper(props) {
  return (
    <>
      <BlogPostPaginator {...props} />
      <Waline serverURL="https://waline-sigma-rose.vercel.app/"/>
    </>
  );
}
