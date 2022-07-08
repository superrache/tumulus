# tumulus

**Tumulus** is an **OpenStreetMap** data visualizer and editor dedicated to history.

Tumulus purposes are:

* Visualize Openstreetmap historical data in an interactive and responsive web map
* Classify data in several thematics
* Clearly read feature attributes and data from linked databases (Wikipedia, wikidata, Mérimée, ...)
* Help editing data by detecting missing attributes or errors. Auto-repair some kind of error
* Provide an editor assistant to complete feature attributes

# See app here: [tumulus.herokuapp.com](https://tumulus.herokuapp.com)

## Project setup
```
npm install
```

Create Postgresql database named `tumulus`

```
sudo psql -Atx postgres://postgres:postgres@localhost:5432/tumulus
```

### Compiles and hot-reloads for development
```
npm run express
npm run serve
```

### Compiles and minifies for production
```
npm run build
npm start
```

### Lints and fixes files
```
npm run lint
```
