#!/bin/bash

for svg_path in ./svg/*.svg; do
    identify ${svg_path}
    svg_filename=$(basename ${svg_path})
    filename=$(echo "${svg_filename}" | sed 's/\.[^.]*$//')
    png_path="../public/img/${filename}.png"
    convert -background none -filter Lanczos -resize 16x ${svg_path} png8:${png_path}
done

