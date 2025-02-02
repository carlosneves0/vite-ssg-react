export default function NavList({ title, htmls }) {
    return (
        <ul>
            {htmls.map(({ link, module }) => (
                <li key={link}>
                    {module.title === title ? (
                        module.title
                    ) : (
                        <a href={link}>{module.title}</a>
                    )}
                </li>
            ))}
        </ul>
    )
}
