import { GetStaticProps } from 'next';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'
import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai'
import Link from 'next/link'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import styles from './home.module.scss';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results || []) ;
  const [nextPage, setNextPage] = useState(postsPagination.next_page || '');

  async function handleLoadMorePosts() {
    const morePostsResponse = await fetch(nextPage)
                            .then(data => data.json());
    
    const newPosts = morePostsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: post.data
      }
    })    

    setNextPage(morePostsResponse.next_page);
    setPosts([... posts, ...newPosts]);    
  }

  return (    
    <main className={styles.container}>              
      {posts.map(post => ( 
        <div key={post.uid} className={styles.postContent}>
          <Link href={`/post/${post.uid}`} >
            <a>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>            
              
              <p className={styles.info}>
                <time><AiOutlineCalendar />&nbsp;{format(new Date(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR })}</time> 
                <span><AiOutlineUser />&nbsp;{post.data.author}</span>             
              </p>
            </a>
          </Link>
        </div>    
      ))}
      {nextPage ?
        <a 
          href="#" 
          onClick={handleLoadMorePosts}
          className={styles.loadMore}
        >
          Carregar mais posts
        </a>
        : ''
      }
    </main>    
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ], { 
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 1,
  });  
  
  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: post.data
    }
  })   

  const postsPagination = {    
    next_page: postsResponse.next_page,
    results: posts,
  }  
  
  return {
    props: {
      postsPagination,
     },
     revalidate: 60*60*1     
  }
};
