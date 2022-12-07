export default function Categories () {
  return (
     <div className="container box container is-max-widescreen">
        <div className="columns">
       <div className="column is-6">
  <p className="control has-icons-left">
    <span className="select">
      <select>
        <option value=''>Brand:</option>
        <option value='nike'>Nike</option>
        <option value='adidas'>Addias</option>
        <option value='puma'>Puma</option>
        <option value='new-balance'>New Balance</option>
      </select>
    </span>
    <span className="icon is-small is-left">
      <i className="fas fa-globe"></i>
    </span>
  </p>
</div>
<div className="column is-3">
  <p className="control has-icons-left">
    <span className="select">
      <select>
        <option value=''>Size:</option>
        <option value='m-6'>M 6</option>
        <option value='m-7'>M 7</option>
        <option value='m-8'>M 8</option>
        <option value='m-9'>M 9</option>
        <option value='m-10'>M 10</option>
        <option value='m-11'>M 11</option>
        <option value='m-12'>M 12</option>
      </select>
    </span>
    <span className="icon is-small is-left">
      <i className="fas fa-globe"></i>
    </span>
  </p>
</div>
<div className="column">
  <p className="control has-icons-left">
    <span className="select">
      <select>
        <option value=''>Feature</option>
        <option value='popular'>Most Popular</option>
        <option value='low-to-high'>Low To High</option>
        <option value='high-to-low'>High To Low</option>
      </select>
    </span>
    <span className="icon is-small is-left">
      <i className="fas fa-globe"></i>
    </span>
  </p>
  </div>
</div>
</div>
  )
}
