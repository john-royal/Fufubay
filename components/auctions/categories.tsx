export default function Categories () {
  return (
     <div className="container box container is-max-widescreen">
        <div className="columns">
       <div className="column is-6">
  <p className="control has-icons-left">
    <span className="select">
      <select>
        <option selected>Brand:</option>
        <option>Nike</option>
        <option>Addias</option>
        <option>Puma</option>
        <option>New Balance</option>
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
        <option selected>Size:</option>
        <option>M 6</option>
        <option>M 7</option>
        <option>M 8</option>
        <option>M 9</option>
        <option>M 10</option>
        <option>M 11</option>
        <option>M 12</option>
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
        <option selected>Feature</option>
        <option>Most Popular</option>
        <option>Low To High</option>
        <option>High To Low</option>
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
