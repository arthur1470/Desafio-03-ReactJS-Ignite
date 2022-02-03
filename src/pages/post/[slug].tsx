import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import { RichText } from "prismic-dom";
import { AiOutlineCalendar, AiOutlineUser, AiOutlineClockCircle } from 'react-icons/ai'
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './styles.module.scss';
import { useRouter } from 'next/router';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}: PostProps) {
  const router = useRouter();
  
  if (router.isFallback) return <h2>Carregando...</h2>
  
  const timeToRead = post.data.content.reduce((sum, item) => {
    const headingWordsCount = item.heading.split(' ').length;    
    const bodyWordsCount = RichText.asHtml(item.body).split(' ').length;
    const total = headingWordsCount + bodyWordsCount;    
    return Math.ceil(sum + total / 200);
  }, 0);

  const timeToRead2 = Math.ceil(JSON.stringify(post.data.content).split(' ').length / 200);  

  return (
    <main>
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="Banner" />
      </div>
      <div className={styles.container}>
        <h1>{post.data.title}</h1>x
        <p className={styles.info}>
          <time><AiOutlineCalendar />&nbsp;{format(new Date(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR })}</time>
          <span><AiOutlineUser />&nbsp;{post.data.author}</span>
          <span><AiOutlineClockCircle />&nbsp;{timeToRead2} min</span>
        </p>
        {post.data.content.map(content => (
          <div key={content.heading} className={styles.contentContainer}>
            <h2>{content.heading}</h2>              
            <div dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}} />                                             
          </div>          
        ))}
      </div>
    </main>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {}
  );

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({params}) => {
  const {slug} = params; 
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});  

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    }
  }
  

  return { 
    props: {      
      post,
    },
    
  }  
};
