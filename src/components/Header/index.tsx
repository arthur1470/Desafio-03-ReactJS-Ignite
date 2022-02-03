import styles from './styles.module.scss'
import Link from 'next/link'

export default function Header() {
  return (
    <header className={styles.headerContainer}>
      <Link href={'/'} prefetch>
        <a>
          <img src="/images/logo.svg" alt="logo" />      
        </a>
      </Link>
    </header>
  )
}
