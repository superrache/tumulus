<template>
  <div id="comment-dialog" v-show="showDialog">
      <h3 class="title">Commentaire des modifications</h3>
      <textarea id="comment" type="text" 
            placeholder="Description de vos contributions" required 
            minLength=1 maxLength="255" size="14" 
            v-model="comment"
            @keyup.enter="save()" autofocus/>
      <div id="buttons">
        <button id="save" v-on:click="save()" :disabled="comment.length == 0">Envoyer</button>
        <button id="close" v-on:click="close()">Annuler</button>
      </div>
    </div>
</template>

<script>

export default {
  name: 'CommentDialog',
  data() {
    return {
      showDialog: false,
      comment: "",
      callback: null
    }
  },
  methods: {
    show(comment, callback) {
        this.comment = comment
        this.showDialog = true
        this.callback = callback
    },
    save() {
        this.showDialog = false
        this.callback(this.comment)
    },
    close() {
      this.showDialog = false
    }
  }
}
</script>

<style scoped>

#comment-dialog {
  display: flex;
  text-align: center;
  flex-direction: column;
  justify-content: center;
}

#comment {
  margin: 10px;
    display: block;
  text-align: left;
  font-size: 1.2em;
}

#buttons {
  margin: 5px;
  padding: 5px;
}

#close {
  margin-left: 10px;
}

</style>