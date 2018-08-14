export default {
  grid: `
    <div class="grid-vis">
      {{#each rows}}
        <div class="row">
          {{#each .}}
            <div class="cell cell-{{.}}">
              {{.}}
            </div>
          {{/each}}
        </div>
      {{/each}}
    </div>
  `
}
